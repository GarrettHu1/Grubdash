const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if(data[propertyName]) {
            return next();
        }
        return next({ status: 400, message: `Must have a ${propertyName}`});
    };
};

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if(foundOrder) {
    res.locals.order = foundOrder;
    return next();
    } else {
        next({ status: 404, message: `Order ${orderId} not found`});
    };
};

function quantityPropertyIsValid(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if ( !dishes || !Array.isArray(dishes) || dishes.length === 0) {
    return next({ status: 400, message: `dish` });
    } else {
        for( dish of dishes) {
            const dishQuantity = Number(dish.quantity)
            const index = dishes.indexOf(dish);
            if( !dishQuantity || dishQuantity <= 0 || !Number.isInteger(dish.quantity)) {
                return next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0` })
            };
        };
        return next();
    };
};

function orderIdMatcher(req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;
  if(id && id !== orderId) {
    return next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.` })
  } else {
    return next();
  }
}

function checkStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  const validStatus = [ "pending", "preparing", "out-for-delivery", "delivered"]
  if(validStatus.includes(status)) {
    return next();
  } else {
    return next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered`})
  };
};

function list(req, res){
    res.json({ data: orders })
}

function create(req, res) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        dishes
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
};

function read(req, res) {
    res.status(200).json({ data: res.locals.order });
};

function update(req, res) {
    const { data: { deliverTo, mobileNumber, status,  dishes } = {} } = req.body;
    const order = res.locals.order;

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({ data: order });
};

function checkPending(req, res, next) {
  const order = res.locals.order
  if(order.status === "pending") {
    return next();
  } else {
    return next({ status: 400, message: `An order cannot be deleted unless it is pending `})
  }
}

function destroy(req, res) {
  const { orderId } = req.params;
    const order = res.locals.order
        const index = orders.findIndex((order) => order.id === Number(orderId));
        orders.splice(index, 1)
        res.sendStatus(204);
}

module.exports = {
    list,
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        quantityPropertyIsValid,
        create
    ],
    read: [ orderExists, read ],
    update: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("status"),
        bodyDataHas("dishes"),
        quantityPropertyIsValid,
        orderExists,
        orderIdMatcher,
        checkStatus,
        update
    ],
    delete: [ orderExists, checkPending, destroy ],
};