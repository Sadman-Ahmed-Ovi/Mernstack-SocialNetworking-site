const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
//const Profile = require('../../models/Profile');
const User = require('../../models/User');

router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty(),

]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    };
    try {
        const user = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar:user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();

        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('error happened')
    }
});
//get posts
router.get('/', auth, async (req, res) => {
    
    try {
        const posts = await Post.find().sort({date:-1}) ;
        
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('error happened')
    }
});

//get post by id
router.get('/:id', auth, async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            res.status(404).json({ nopostfound: 'No post found with that ID' })
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('error happened')
    }
});

//delete post by id
router.delete('/:id', auth, async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404).json({ nopostfound: 'No post found with that ID' })
        };
        if (post.user.toString() !==req.user.id) {
            res.status(401).json({ nopostfound:"Not authorized" })
        }
        await post.remove();

        res.json({msg:"removed"})
    } catch (err) {
        console.error(err.message);
        res.status(500).send('error happened')
    }
});

//likes
router.put('/like/:id', auth, async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);
        if(post.likes.filter(like=>like.user.toString()===req.user.id).length>0){
           return res.status(400).json({ msg: 'post already liked' })
        }
        post.likes.unshift({ user: req.user.id });

        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('error happened')
    }
});
//unlike
router.put('/unlike/:id', auth, async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
          return  res.status(400).json({ msg: 'post is not  liked' })
        }
        const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

        // Splice out of array
        post.likes.splice(removeIndex, 1);

        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('error happened')
    }
});
//comment
router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty(),

]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    };
    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };
        post.comments.unshift(newComment)

         await post.save();

        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('error happened')
    }
});



//delete comment

router.delete(
    '/comment/:id/:comment_id',
    auth,
    async (req, res) => {
        try{
            const post = await Post.findById(req.params.id);

            const comment = post.comments.find(comment=>comment.id===req.params.comment_id);

            if (!comment) {
                res.status(404).json({ nopostfound: 'No comment found with that ID' })
            };

            if(comment.user.toString() !==req.user.id){
                res.status(401).json({ nopostfound: 'Not authorized' })
            };

            const removeIndex = post.comments
                .map(comment => comment.user.toString())
                .indexOf(req.user.id);

            // Splice out of array
            post.comments.splice(removeIndex, 1);

            await post.save();

            res.json(post.comments);
        }catch(err){
            console.error(err.message);
            res.status(500).send('error happened')
        }
        
    });
module.exports = router; 
