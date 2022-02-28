const path = require("path");
const { stringify } = require("querystring");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function list(req, res) {
    const { orderId } = req.params;
    res.json({ data: dishes.filter( orderId ? dish => dish.orderId === Number(orderId) : () => true )});
};

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id = Number(dishId));
    if (foundDish) {
        res.locals.foundDish = foundDish;
        return next();
    }
    return next({ status: 404, message: `Dish does not exist: ${dishId}.`});
};

function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if(data[propertyName]) {
            return next();
        }
        return next({ status: 400, message: `Must have a ${propertyName}`});
    };
};

function ifIdIsPresent(req, res, next) {
    const { dishId } = req.params;
    const { data: { id, name, description, price, image_url } = {} } = req.body;
    const dish = res.locals.foundDish;
    if(id) {
        if(id === dishId){
            return next();
        } else {
            return next({ status: 400, message: `Dish id and ${id} need to match`});
        }
    } else {
       return next();
    };
};

// function priceValidation(req, res, next) {
//     const { data: { price } = {} } = req.body;
//     if(price) {
//         return next();
//     } else {
//         next({ status: 400, mesage: `Price: ${price} is invalid`});
//     }
// }

function create(req, res) {
    const { data: { name, price, description, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        price: Number(price),
        description,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish});
};

function read(req, res) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === Number(dishId));
    res.json({ data: foundDish });
};

function update(req, res) {
    const { dishId } = req. params;
    const dish = res.locals.foundDish;
    const { data: { id, name, description, price, image_url } = {} } = req.body;
    //sets dish properties
    if(id){
        dish.id = id;
    } else {
        dish.id= nextId();
    };
    dish.name = name;
    dish.description = description;
    if(price && Number(price) > 0){
        dish.price = price;
    }
    dish.image_url = image_url;

    //displays newly modified dish
    res.json({ data: dish });
};

// function destroy(req, res) {
//     const { dishId } = req.params;
//     const index = dishes.findIndex((dish) => dish.id === Number(dishId));
//     if(index > -1) {
//         const deletedDish = dishes.splice(index, 1);
//     };
//     res.sendStatus(405);
// };

// TODO: Implement the /dishes handlers needed to make the tests pass

module.exports ={
    list,
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        create
    ],
    read: [ dishExists, read ],
    update: [
        dishExists,
        ifIdIsPresent,
//        priceValidation,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        update
    ],
    dishExists,
};