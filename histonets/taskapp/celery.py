import os
import logging

from celery import Celery
from django.apps import apps, AppConfig
from django.conf import settings


if not settings.configured:
    # Set the default Django settings module for the 'celery' program.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE',
                          'config.settings.production')  # pragma: no cover

app = Celery('histonets')
logger = logging.getLogger(__name__)


class CeleryConfig(AppConfig):
    name = 'histonets.taskapp'
    verbose_name = 'Celery Config'

    def ready(self):
        # Using a string here means the worker will not have to
        # pickle the object when using Windows.
        app.config_from_object('django.conf:settings')
        installed_apps = [app_config.name
                          for app_config in apps.get_app_configs()]
        app.autodiscover_tasks(lambda: installed_apps, force=True)


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')  # pragma: no cover


def task_setup():
    """Setup the worker if needed. Only for execution within cloud providers"""
    task_environment_options = getattr(settings,
                                       'CELERYD_ENVIRONMENT_OPTIONS', {})
    if 'AWS' in task_environment_options:
        import boto3
        aws = task_environment_options.get('AWS')
        ecs = boto3.client('ecs')
        ec2 = boto3.client('ec2')
        task_definition_arns = ecs.list_task_definitions(
            familyPrefix=aws.get('TASK_DEFINITION_FAMILY_PREFIX'), maxResults=1
        ).get('taskDefinitionArns')
        task_definition_arn = task_definition_arns and task_definition_arns[0]
        cluster_arn = next(filter(
            lambda arn: aws.get('CLUSTER_ARN_CONTAINS') in arn,
            ecs.list_clusters().get('clusterArns')
        ))
        vpc_ids = ec2.describe_vpcs(Filters=[{
            'Name': 'tag:Environment',
            'Values': aws.get('VPC_TAG_ENVIRONMENT'),
        }]).get('Vpcs')
        vpc_id = vpc_ids and vpc_ids[0].get('VpcId')
        subnet_ids = ec2.describe_subnets(Filters=[
            {'Name': 'vpc-id', 'Values': [vpc_id]},
            {'Name': 'tag:Name', 'Values': aws.get('SUBNET_TAG_NAME')}
        ]).get('Subnets')
        subnet_id = subnet_ids and subnet_ids[0].get('SubnetId')
        group_ids = ec2.describe_security_groups(Filters=[
            {'Name': 'vpc-id', 'Values': [vpc_id]},
            {'Name': 'group-name', 'Values': aws.get('SECURITY_GROUP_NAME')}
        ]).get('SecurityGroups')
        group_id = group_ids and group_ids[0].get('GroupId')
        if all((task_definition_arn, cluster_arn, vpc_id, subnet_id, group_id)):
            logger.info("AWS Task Definition ARN: {}".format(
                task_definition_arn))
            logger.info("AWS Cluster ARN: {}".format(cluster_arn))
            logger.info("AWS VPC ID: {}".format(vpc_id))
            logger.info("AWS Subnet ID: {}".format(subnet_id))
            logger.info("AWS Security Group ID: {}".format(group_id))
            task_output = ecs.run_task(
                cluster=cluster_arn,
                taskDefinition=task_definition_arn,
                overrides={
                    "containerOverrides": [{
                        'name': aws.get('CONTAINER_NAME'),
                        'cpu': aws.get('CONTAINER_CPU'),
                        'memory': aws.get('CONTAINER_MEMORY'),
                        'command': aws.get('CONTAINER_COMMAND'),
                    }],
                },
                launchType=aws.get('CONTAINER_LAUNCH_TYPE'),
                networkConfiguration={
                    'awsvpcConfiguration': {
                        'assignPublicIp': 'DISABLED',
                        'securityGroups': [group_id],
                        'subnets': [subnet_id],
                    }
                }
            ).get('tasks')
            task_arn = task_output and task_output[0].get('taskArn')
            logger.info("AWS task ARN: {}".format(task_arn))
            update_output = ecs.update_service(
                cluster=cluster_arn,
                service=aws.get('SERVICE_NAME'),
                taskDefinition=task_definition_arn,
            )
            logger.info("AWS update service: {}".format(str(update_output)))
            return {
                'cluster_arn': cluster_arn,
                'task_arn': task_arn,
            }
        else:
            raise ImproperlyConfigured(
                'Incorrect options for key AWS in CELERYD_ENVIRONMENT_OPTIONS')
    else:
        return None


def task_teardown(**kwargs):
    if kwargs:
        task_environment_options = getattr(settings,
                                           'CELERYD_ENVIRONMENT_OPTIONS', {})
        if 'AWS' in task_environment_options:
            import boto3
            ecs = boto3.client('ecs')
            cluster_arn = kwargs.get('cluster_arn')
            task_arn = kwargs.get('task_arn')
            logger.info("Attempting to stop AWS task '{}' ({})".format(
                str(task_arn), str(cluster_arn)))
            if task_arn and cluster_arn:
                output = ecs.stop_task(cluster=cluster_arn, task=task_arn)
                logger.info("Stopping AWS task '{}': {}".format(task_arn,
                                                                str(output)))
            else:
                logger.info("Missing AWS task ({}) or cluster ({})".format(
                    str(task_arn), str(cluster_arn)))
