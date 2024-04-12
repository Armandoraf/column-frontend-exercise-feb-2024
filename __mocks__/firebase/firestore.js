export const collection = jest.fn();
export const getDocs = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ docs: [] }));
export const query = jest.fn();
export const orderBy = jest.fn();
export const where = jest.fn();
export const limit = jest.fn();
export const startAfter = jest.fn();
export const doc = jest.fn();
export const getDoc = jest.fn(() =>
  Promise.resolve({
    exists: () => true,
    data: () => ({
      title: "Test Notice",
      content: "This is a test notice content.",
      publicationDate: {
        seconds: new Date("07/01/2021").getTime() / 1000,
      },
    }),
  })
);
