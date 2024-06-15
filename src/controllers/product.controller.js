import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js";
import deleteImage from "../utils/removeCloudinary.js";
import { v4 as uuidv4 } from 'uuid';
// CREATE PRODUCT
export const CreateProduct = async (req, res) => {
    try {
        const { name, description, price, category, quantity, brand } = req.body;
        const imageFiles = req.files;
        // console.log('imageFiles', imageFiles)
        if ([name, description, price, category, quantity, brand, imageFiles].some(field => !field)) {
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
        let imageArr = [];
        await Promise.all(imageFiles.map(async (file, index) => {
            const response = await uploadOnCloudinary(file.path, uuidv4() + index);
            // console.log(response);
            imageArr.push({
                publicId: response.public_id,
                url: response.url
            });
        }));
        // console.log('imageArr', imageArr);
        const product = new Product({ ...req.body, seller: req.user.id, images:imageArr });
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
        const imageFiles = req.files

        if ([name, description, price, category, quantity, brand].some(field => !field)) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        await Promise.all(imageFiles?.map(async(file, index) =>await deleteImage(product.images[index]?.publicId +index)))
        let imageArr = [];
        await Promise.all(imageFiles.map(async (file, index) => {
            const response = await uploadOnCloudinary(file.path, uuidv4() + index);
            // console.log(response);
            imageArr.push({
                publicId: response.public_id,
                url: response.url
            });
        }));

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                $set: { ...req.body, seller: req.user.id, image:imageArr}
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
        const product = await Product.findById(req.params.id).populate("seller").populate("category")
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
        // await Promise.all(product.images?.map(async(image, index) => await deleteImage(product.images[index]?.publicId +index)))
         // Delete each image associated with the product
         if (product.images) {
            await Promise.all(product.images.map(async (image) => {
                await deleteImage(image.publicId);
            }));
        }

        
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

// PRODUCTS PAGINATION FOR ADMIN
export const FetchProducts = async (req, res) => {
    try {
        const { category, radio, brand, sort } = req.body;
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const pageSize = 6;

        let args = {};
      if(search !== "") args.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ]
        // console.log("args: " + JSON.stringify(args));

        // Count total documents matching the query
        const count = await Product.countDocuments(args);
        const skip = (page - 1) * pageSize;

        const products = await Product.find(args).populate("category").limit(pageSize).skip(skip);;
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

// PRODUCTS FILTER AND PAGINATION FOR USER
export const FetchProductsForUser = async (req, res) => {
    try {
        const { category, radio, brand, sort } = req.body;
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const pageSize = 8;

        let args = {};
        if (category?.length > 0) args.category = category; //["id1", "id2"]
        if (brand?.length > 0) args.brand = brand; 
        if (radio?.length > 0) args.price = { $gte: radio[0], $lte: radio[1] };
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

//LATEST PRODUCTS
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

// ADMIN DASHBOARD
export const AdminDashboard = async (req, res) => {
    try {
        const count = await Product.countDocuments();
        const userCount = await User.find({role: "user"}).countDocuments();
        const sellerCount = await User.find({role: "seller"}).countDocuments();
        const orderCount = await Order.countDocuments();
        return res.status(200).json({
            success: true,
            data: {
                totalProduct: count,
                totalUser: userCount,
                totalSeller: sellerCount,
                totalOrder: orderCount,
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// SELLER DASHBOARD
export const SellerDashboard = async (req, res) => {
    try {
        const count = await Product.find({seller: req.user.id}).countDocuments();
        const orders = await Order.find();
        if(!orders) {
            return res.status(409).json({
                success: false,
                message: "Unable to fetch"
            });
        }

        const sellerOrders = [];

        // Iterate over each order
        orders.map(order => {
            // Filter orderItems where seller matches req.user._id
            const filteredItems = order.orderItems.filter(item => item.seller.toString() === req.user._id.toString());
            // console.log("filteredItems", filteredItems);

            // If there are any filtered items, create a new order object with those items
            if (filteredItems.length > 0) {
                sellerOrders.push({
                    ...order._doc, // Spread the original order properties
                    orderItems: filteredItems // Override orderItems with the filtered items
                });
            }
        });
        return res.status(200).json({
            success: true,
            data: {
                totalProduct: count,
                totalOrder: sellerOrders.length,
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// GET BRANDS
export const GetBrands = async (req, res) => {
    try {
        const products = await Product.find({})
        const brands = products.map(product => product.brand).filter((value, index, self) => self.indexOf(value) === index);
        return res.status(200).json({
            success: true,
            data: brands
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}