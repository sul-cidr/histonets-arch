import requestAnimationFrame from "../../config/shim"

jest.useFakeTimers();

test("requestAnimationFrame sets a callback time out", () => {
  const callback = jest.fn();
  requestAnimationFrame(callback);
  expect(setTimeout).toBeCalled();
});
