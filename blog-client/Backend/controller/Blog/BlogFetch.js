const BlogModel = require("./../../model/Blog/BlogModel");
const UserModel = require("./../../model/User/UserModel");

const BlogFetchController = async (req, res) => {
    try {
        const blogs = await BlogModel.find().sort({ createdAt: -1 });
        if (!blogs) {
            return res.status(404).json({
                message: "Blog not found",
                success: false,
            });
        }

        // Fetch author details for each blog
        const blogsWithAuthor = await Promise.all(
            blogs.map(async (blog) => {
                const blogObj = blog.toObject();
                
                // Fetch user details using authorId
                const user = await UserModel.findById(blog.authorId);
                
                // Transform author to object with name and avatar
                blogObj.author = {
                    name: user ? user.username : blog.author || 'Anonymous',
                    avatar: user ? user.profilePicture : null
                };
                
                return blogObj;
            })
        );

        return res.status(200).json({
            message: "Blog fetched successfully",
            success: true,
            data: blogsWithAuthor,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

module.exports = BlogFetchController