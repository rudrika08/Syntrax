const BlogModel = require("../../model/Blog/BlogModel");
const UserModel = require("../../model/User/UserModel");
const blogFetchByBlogIdController = async (req, res) => {
    try{
        const blogId = req.body.id;

        // console.log(blogId);

        if (!blogId) {
            return res.status(400).json({
                message: "Blog ID is required",
                success: false,
            });
        }

        const blog = await BlogModel.findById(blogId);
        if (!blog) {
            return res.status(404).json({
                message: "Blog not found",
                success: false,
            });
        }
        // Attach author details (name, profilePicture) if possible
        const blogObj = blog.toObject();
        try {
            const user = await UserModel.findById(blogObj.authorId);
            if (user) {
                blogObj.author = {
                    name: user.username || blogObj.author || 'Anonymous',
                    avatar: user.profilePicture || null,
                };
            } else {
                // keep existing author field (string) if no user found
                blogObj.author = {
                    name: blogObj.author || 'Anonymous',
                    avatar: null,
                };
            }
        } catch (err) {
            blogObj.author = {
                name: blogObj.author || 'Anonymous',
                avatar: null,
            };
        }

        return res.status(200).json({
            message: "Blog fetched successfully",
            success: true,
            data: blogObj,
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}

module.exports = blogFetchByBlogIdController