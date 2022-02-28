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
    const foundOrder = orders.find((order) => order.id === Number(orderId));
    if(foundOrder) {
    res.locals.currOrder = foundOrder;
    return next();
    } else {
        return next({ status: 404, message: `Order ${orderId} not found`});
    };
};

function list(req, res){
    res.json({ data: orders })
}

function create(req, res) {
    const { data: { deliverTo, mobileNumber, status,  dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
};

function read(req, res) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === Number(orderId));
    res.status(201).json({ data: foundOrder })
}

function update(req, res) {
    const { data: { deliverTo, mobileNumber, status,  dishes } = {} } = req.body;
    const order = res.locals.currOrder;

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({ data: order });
};

function destroy(req, res) {
    const { orderId } = req.params;
    const order = res.locals.currOrder;
    if(order.status !== "pending") {
        return next({ status: 400, message: `An order cannot be deleted unless it is pending `})
    } else {
        const index = orders.findIndex((order) => order.id === Number(orderId));
        const deletedOrder = orders.splice(index, 1)
        res.sendStatus(204);
    }
}

module.exports = {
    list,
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("status"),
        bodyDataHas("dishes"),
        create
    ],
    read: [ orderExists, read ],
    update: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("status"),
        bodyDataHas("dishes"),
        update
    ],
    delete: [ orderExists, destroy ],
};