import { getCookie, removeDuplicates } from '../utils';

describe('utils', () => {
  it('getCookie returns a cookie value from document.cookie', () => {
    document.cookie = 'key=value;othercookie=othervalue';
    expect(getCookie('key')).toMatchSnapshot();
  });

  it('getCookie returns nothing when the cookie is not present in document.cookie', () => {
    document.cookie = 'key=value;othercookie=othervalue';
    expect(getCookie('nonexistingkey')).toMatchSnapshot();
  });

  it('getCookie returns nothing when no cookie is set in document.cookie', () => {
    document.cookie = null;
    expect(getCookie('key')).toMatchSnapshot();
  });

  it('getCookie returns nothing when cookie is an empty string', () => {
    document.cookie = '';
    expect(getCookie('key')).toMatchSnapshot();
  });

  it('removeDuplicates removes duplicates by key', () => {
    const array = [{'key': 1}, {'key': 1}, {'key': 1}, {'key': 1}];
    expect(removeDuplicates(array)).toMatchSnapshot();
  });
});
