import Product from "../models/product.model.js";
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js";
import deleteImage from "../utils/removeCloudinary.js";

// CREATE PRODUCT
export const CreateProduct = async (req, res) => {
    try {
        const { name, description, price, category, quantity, brand } = req.body;
        const imageLocalPath = req.file.path
        if ([name, description, price, category, quantity, brand, imageLocalPath].some(field => !field)) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const existedPrdocut = await Product.findOne({ seller: req.user.id, name });
        if (existedPrdocut) {
            return res.status(409).json({
                success: false,
                message: "Product is already exist",
            })
        }
        const response = await uploadOnCloudinary(imageLocalPath, req.user.id);
        const product = new Product({ ...req.body, seller: req.user.id, image: { publicId: response.public_id, url: response.url } })
        // console.log(product)
        await product.save();
        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// UPDATE THE PRODUCT BY ID
export const UpdateProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Invalid product id"
            })
        }
        const { name, description, price, category, quantity, brand } = req.body;
        const imageLocalPath = req.file.path

        if ([name, description, price, category, quantity, brand, imageLocalPath].some(field => !field)) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        await deleteImage(product.seller.toString());
        const response = await uploadOnCloudinary(imageLocalPath, req.user.id);

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                $set: { ...req.body, seller: req.user.id, image: { publicId: response.public_id, url: response.url } }
            },
            {
                new: true
            }
        )

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// FETCH PRODUCT BY ID
export const ProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: true,
                message: "Product not found",
            })
        }
        return res.status(201).json({
            success: true,
            data: product
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// FETCH PRODUCTS BASED ON SELLERS
export const ProductsBySeller = async (req, res) => {
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const pageSize = 6;

        // Construct query object
        const query = {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ],
            seller: req.user.id,
        };

        // Count total documents matching the query
        const count = await Product.countDocuments(query);
        const skip = (page - 1) * pageSize;

        const products = await Product.find(query).sort({ createAt: -1 }).limit(pageSize).skip(skip);;
        if (!products) {
            return res.status(500).json({
                success: false,
                message: "Unable to fetch products",
            })
        }
        return res.status(201).json({
            success: true,
            data: products,
            pages: Math.ceil(count / pageSize),
            currentPage: page,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// DELETE PRODUCT BY ID
export const DeleteProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        await deleteImage(product.seller);
        const deletePrdouct = await Product.findByIdAndDelete(req.params.id);
        if (!deletePrdouct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// PRODUCTS FILTER AND PAGINATION
export const FetchProducts = async (req, res) => {
    try {
        const { category, radio, brand, sort } = req.body;
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const pageSize = 6;

        let args = {};
        if (category?.length > 0) args.category = category; //["id1", "id2"]
        if (brand?.length > 0) args.brand = brand; 
        if (radio?.length) args.price = { $gte: radio[0], $lte: radio[1] };
        if(search !== "") args.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ]
        // console.log("args: " + JSON.stringify(args));

        // Count total documents matching the query
        const count = await Product.countDocuments(args);
        const skip = (page - 1) * pageSize;

        const products = await Product.find(args).populate("category").sort(sort ? sort : {}).limit(pageSize).skip(skip);;
        return res.status(200).json({
            success: true,
            data: products,
            pages: Math.ceil(count / pageSize),
            currentPage: page,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// PRODUCT REVIEW BY USER USING PRODUCT ID
export const ProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (![rating, comment].every(field => field !== undefined && field !== '')) {
            return res.status(400).json({
                success: false,
                message: "Both rating and comment are required"
            });
        }

        const ratingValue = parseInt(rating);
        console.log('rating', typeof rating)
        if (isNaN(ratingValue)) {
            return res.status(400).json({
                success: false,
                message: "Rating must be a valid number"
            });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        // Check if the user has already reviewed the product
        const alreadyReviewed = product.reviews.some(review => review.user.toString() === req.user.id.toString());
        if (alreadyReviewed) {
            return res.status(409).json({
                success: false,
                message: "Product already reviewed"
            });
        }

        const name = `${req.user.firstName} ${req.user.lastName}`;
        const review = {
            user: req.user.id,
            name,
            rating: ratingValue,
            comment
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => acc + item.rating, 0) / product.reviews.length;
        await product.save();

        return res.status(201).json({
            success: true,
            message: "Review added"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//TOP 4 PRODUCTS
export const FetchTopProduct = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ rating: -1 }).limit(4);
        return res.status(200).json({
            success: true,
            data: products
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//TOP 4 PRODUCTS
export const FetchNewProduct = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ _id: -1 }).limit(4);
        return res.status(200).json({
            success: true,
            data: products
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


