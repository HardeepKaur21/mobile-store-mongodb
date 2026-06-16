const { MongoClient } = require("mongodb"); //this let's node.js to talk to mongodb

const uri =
  "mongodb+srv://dbUser:dbUser@assignment05-cluster.kv8g5zs.mongodb.net/?appName=assignment05";

const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB Atlas");

    const db = client.db("assignment05");
    return db;
  } catch (error) {
    console.error("Connection failed: ", error);
  }
}

//------------------------------------------------------------------------------------------------------------------------------

async function insertCustomer(db) {
  //customer object
  const customer = {
    title: "Mrs",
    firstName: "Jane",
    surname: "Doe",
    mobile: "0871234567",
    email: "jane.doe@email.com",

    homeAddress: {
      addressLine1: "12 Main Street",
      addressLine2: "",
      town: "Aston",
      county: "Meath",
      eircode: "W23AB12",
    },

    shippingAddress: {
      addressLine1: "12 Main Street",
      addressLine2: "",
      town: "Aston",
      county: "Meath",
      eircode: "W23AB12",
    },
  };

  const result = await db.collection("customers").insertOne(customer);

  console.log("Customer inserted with ID: ", result.insertedId);
}

//------------------------------------------------------------------------------------------------------------------------------

//to find a customer with specific details just parse it in
//async function findCustomerByEmail(db, email) {
// .......
// .... .findOne({ email: email });

//the code above looks for a customer with a specific email
async function findCustomer(db) {
  const customer = await db.collection("customers").findOne();

  if (!customer) {
    console.log("No customer found");
    return;
  }

  console.log();
  console.log("Customer Details");
  console.log("------------------");
  console.log("Title:", customer.title);
  console.log("Name:", customer.firstName, customer.surname);
  console.log("Mobile:", customer.mobile);
  console.log("Email:", customer.email);

  console.log("Home Address:");
  console.log(customer.homeAddress.addressLine1);
  console.log(customer.homeAddress.town);
  console.log(customer.homeAddress.county);
  console.log(customer.homeAddress.eircode);

  console.log("Shipping Address:");
  console.log(customer.shippingAddress.addressLine1);
  console.log(customer.shippingAddress.town);
  console.log(customer.shippingAddress.county);
  console.log(customer.shippingAddress.eircode);
}

//------------------------------------------------------------------------------------------------------------------------------

async function updateCustomer(db) {
  //choose customer to update
  const filter = { email: "jane.doe@email.com" };

  //define new values
  const update = {
    $set: {
      title: "Dr",
      mobile: "0899999999",
      email: "jane.updated@email.com",

      homeAddress: {
        addressLine1: "45 New Road",
        addressLine2: "",
        town: "Leixlip",
        county: "Kildare",
        eircode: "W23CD34",
      },

      shippingAddress: {
        addressLine1: "45 New Road",
        addressLine2: "",
        town: "Leixlip",
        county: "Kildare",
        eircode: "W23CD34",
      },
    },
  };

  const result = await db.collection("customers").updateOne(filter, update);

  if (result.matchedCount === 0) {
    console.log("No customer matched for update");
    return;
  }

  console.log("Customer updated successfully");
}

//------------------------------------------------------------------------------------------------------------------------------

async function deleteCustomer(db) {
  //choose what customer to delete
  const filter = {
    email: "jane.updated@email.com",
    mobile: "0899999999",
    firstName: "Jane",
    surname: "Doe",
  };

  const result = await db.collection("customers").deleteOne(filter);

  if (result.deletedCount === 0) {
    console.log("No customer found to delete");
    return;
  }

  console.log("Deleted successfully");
}

//------------------------------------------------------------------------------------------------------------------------------

async function insertItem(db) {
  const item = {
    manufacturer: "Huawei",
    model: "Huawei 1",
    price: 899,
  };

  const result = await db.collection("items").insertOne(item);

  console.log("Item inserted");
}

//------------------------------------------------------------------------------------------------------------------------------

//same concept to find a specific item as in
async function findItem(db) {
  const item = await db.collection("items").findOne();

  if (!item) {
    console.log("No iteam was found");
    return;
  }

  console.log();
  console.log("Item Details");
  console.log("------------------");
  console.log("Manufacturer:", item.manufacturer);
  console.log("Model:", item.model);
  console.log("Price:", item.price);
}

//------------------------------------------------------------------------------------------------------------------------------

async function updateItem(db) {
  const filter = { manufacturer: "Apple" };
  const update = {
    $set: {
      manufacturer: "Samsung",
    },
  };

  await db.collection("items").updateOne(filter, update);

  console.log("Successfully updated");
}

//------------------------------------------------------------------------------------------------------------------------------

async function deleteItem(db) {
  const filter = { manufacturer: "Samsung" };

  const result = await db.collection("items").deleteOne(filter);

  if (result.deletedCount === 0) {
    console.log("No item found to delete");
    return;
  }

  console.log(`Successfully deleted ${result.deletedCount}`);
}

//------------------------------------------------------------------------------------------------------------------------------

async function insertOrder(db) {
  const customer = await db.collection("customers").findOne();

  if (!customer) {
    console.log("No customer found. Cannot create order.");
    return;
  }

  const items = await db.collection("items").find().limit(2).toArray();

  if (items.length === 0) {
    console.log("No items found");
    return;
  }

  const order = {
    customerId: customer._id,
    items: items.map((item) => item._id), //returns a new array of ite id values
    orderDate: new Date(),
  };

  await db.collection("orders").insertOne(order);
  console.log("Order was created");
}

//------------------------------------------------------------------------------------------------------------------------------

async function findOrder(db) {
  const order = await db.collection("orders").findOne();

  if (!order) {
    console.log("Order was not found");
    return;
  }

  const customer = await db
    .collection("customers")
    .findOne({ _id: order.customerId });

  const items = await db
    .collection("items")
    .find({ _id: { $in: order.items } })
    .toArray();

  console.log();
  console.log("Order Details");
  console.log("----------------");

  console.log("Order Date:", order.orderDate.toDateString());

  if (customer) {
    console.log(
      "Customer:",
      customer.firstName,
      customer.surname,
      `(${customer.email})`
    );
  }

  console.log("Items Purchased:");
  items.forEach((item) => {
    console.log(`${item.manufacturer} ${item.model} - €${item.price}`);
  });
}

//------------------------------------------------------------------------------------------------------------------------------

async function updateOrder(db) {
  const order = await db.collection("orders").findOne();

  if (!order) {
    console.log("No order found to update");
    return;
  }

  const newItems = await db.collection("items").find().limit(1).toArray();

  if (newItems.length === 0) {
    console.log("No order iteams available to update order");
    return;
  }

  const result = await db.collection("orders").updateOne(
    { _id: order._id },
    {
      $set: {
        items: newItems.map((item) => item._id),
        orderDate: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    console.log("Order update failed");
    return;
  }

  console.log("Order updated successfully");
}

//------------------------------------------------------------------------------------------------------------------------------

async function deleteOrder(db) {
  const order = await db.collection("orders").findOne();

  if (!order) {
    console.log("No order was found");
    return;
  }

  const result = await db.collection("orders").deleteOne({ _id: order._id });

  if (result.deletedCount === 0) {
    console.log("Order deletion failed");
  }

  console.log("Order deleted successfully");
}

//------------------------------------------------------------------------------------------------------------------------------

async function main() {
  const db = await connectToDatabase();

  if (db) {
    await insertCustomer(db);
    //to find a customer with a specific email or name call this: (but you would have to change the function above too)
    //await findCustomerByEmail(db, "jane.doe@email.com");
    await findCustomer(db);
    await updateCustomer(db);
    await deleteCustomer(db);

    await insertItem(db);
    await findItem(db);
    await updateItem(db);
    await deleteItem(db);

    await insertOrder(db);
    await findOrder(db);
    await updateOrder(db);
    await deleteOrder(db);
  }
}

main();
