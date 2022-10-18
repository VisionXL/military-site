const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //YOUR USER ID
            author: '6333004d56a582599e9abc61',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dcxxiszzf/image/upload/v1664465234/YelpCamp/2021-03-10T201926Z_419170670_RC2K8M9HXQMN_RTRMADP_3_HEALTH-CORONAVIRUS-VACCINES-1024x683_zttgpj.jpg',
                    filename: 'YelpCamp/2021-03-10T201926Z_419170670_RC2K8M9HXQMN_RTRMADP_3_HEALTH-CORONAVIRUS-VACCINES-1024x683_zttgpj'
                },
                {
                    url: 'https://res.cloudinary.com/dcxxiszzf/image/upload/v1664465518/YelpCamp/marina_pjaxoc.jpg',
                    filename: 'YelpCamp/marina_pjaxoc'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})