export const invoice = {
  customer: {
    name: "John Doe",
    phone: "1234567890",
    address: "123 Some Street",
    city: "Some City",
    email: "example@gmail.com",
  },
  order: [
    {
      product_id: 1,
      name: "Product 1",
      quantity: 2,
      price: 10,
    },
    {
      product_id: 2,
      name: "Product 2",
      quantity: 1,
      price: 20,
    },
  ],
  total: 40,
  paid: 10,
  status: "pending",
  invoice_id: 32187438204,
  due_date: "15/7/2022",
};
