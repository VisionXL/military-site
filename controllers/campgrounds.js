const Campground = require('../models/campground');

const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));
const MaplibreGeocoder =  require('@maplibre/maplibre-gl-geocoder');
// require('@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css');


// const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require("../cloudinary");


var geocoder_api = {
    forwardGeocode: async (config) => {
        const features = [];
        try {
            let request =
                'https://nominatim.openstreetmap.org/search?q=' +
                config.query +
                '&format=geojson&polygon_geojson=1&addressdetails=1';
            const response = await fetch(request);
            const geojson = await response.json();
            for (let feature of geojson.features) {
                let center = [
                    feature.bbox[0] +
                    (feature.bbox[2] - feature.bbox[0]) / 2,
                    feature.bbox[1] +
                    (feature.bbox[3] - feature.bbox[1]) / 2
                ];
                let point = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: center
                    },
                    place_name: feature.properties.display_name,
                    properties: feature.properties,
                    text: feature.properties.display_name,
                    place_type: ['place'],
                    center: center
                };
                features.push(point);
            }
        } catch (e) {
            console.error(`Failed to forwardGeocode with error: ${e}`);
        }

        return {
            features: features
        };
    }
};


// const geocoder = new MaplibreGeocoder(geocoder_api, {});

module.exports.index = async (req, res) => {
    console.log("Success")
    const campgrounds = await Campground.find({}).sort({'_id': -1}).populate('popupText');
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    console.log("New")
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    let tempData = {}
    const geodata = geocoder_api.forwardGeocode({
        query: req.body.campground.location
    }).then((data) => {
        tempData = data.features[0]
    });
    setTimeout(async () => {
        console.log(tempData)
        const campground = new Campground(req.body.campground);
        campground.geometry = tempData.geometry;
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.author = req.user._id;
        
        await campground.save();
        console.log(campground);
        req.flash('success', 'Successfully made a new Personnel!');
        res.redirect(`/campgrounds/${campground._id}`)
    }, 3000);    
}

module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
    }).populate();
    if (!campground) {
        req.flash('error', 'Cannot find that Personnel!');
        return res.redirect('/campgrounds');
    }
  
    // console.log(campground.reviews)
    res.render('campgrounds/show', { campground});
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    console.log(campground)
    if (!campground) {
        req.flash('error', 'Cannot find that Personnel!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated Personnel!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Personnel')
    res.redirect('/campgrounds');


}

module.exports.payForCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that Personnel!');
        return res.redirect('/campgrounds');
    }
   
    // console.log(campground.reviews)
    // res.send({"id": campground.id, "name": campground.name})
    res.render('payment', { campground});
}

module.exports.checkout = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that Personnel!');
        return res.redirect('/campgrounds');
    }
    let request =`https://blockchain.info/tobtc?currency=USD&value=${campground.price}`;
    const response = await fetch(request);
    const btcAmount = await response.json();
    console.log(btcAmount)

    res.render('checkout', {campground, btcAmount})
}