import Category from "../models/category.model.js"

//CREATE CATEGORY
export const CreateCategory = async (req, res) => {
    try {
        if(!req.body.name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }
        const existedCategory = await Category.findOne({name: req.body.name});
        if(existedCategory) {
            return res.status(409).json({
                success: false,
                message: "Category name already exist"
            });
        }
        const category = new Category({
            name: req.body.name
        });
        await category.save();

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            date: category
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//GET CATAGORY BY ID
export const CategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Categoy not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// GET ALL CATEGORIES
export const Categories = async (req, res) => {
    try {
        const categories = await Category.find({});
        if (!categories) {
            return res.status(500).json({
                success: false,
                message: "Unable to fetch"
            });
        }
        return res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// UPDATE CATEGORY BY ID
export const UpdateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    name
                }
            },
            {
                new: true
            }
        )
        if(!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// DELETE CATEGORY BY ID
export const DeleteCategory = async (req, res) => {
    try {
        const deleteCategorty = await Category.findByIdAndDelete(req.params.id);
        if(!deleteCategorty) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}