const express = require("express");
const router = express.Router();
const User = require("../models/user");
const multer = require("multer");
const fs = require('fs');



//image upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

//ınsert an user database route

router.post("/add", upload, async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
    });
    await user.save();
    req.session.message = {
      type: "success",
      message: "Kullanıcı Başarıyla Eklendi",
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});
// get all user
router.get("/", (req, res) => {
   User.find().exec()
     .then(users => {
       res.render("index", {
         title: "Home Page",
         users: users,
       });
     })
     .catch(err => {
       res.json({ message: err.message });
     });
 });
 

router.get("/add", (req, res) => {
  res.render("add_users", { title: "add users" });
});

//edit user router
router.get('/edit/:id', async (req, res) => {
  try {
    let id = req.params.id;
    let user = await User.findById(id).exec();
    if (user == null) {
      res.redirect('/');
    } else {
      res.render('edit_users', {
        title: 'Edit User',
        user: user,
      });
    }
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

//update user router
router.post('/update/:id', upload, async (req, res) => {
  try {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
      new_image = req.file.filename;
      try {
        fs.unlinkSync('./uploads/' + req.body['old-image']);
      } catch (error) {
        console.log(error);
      }
    } else {
      new_image = req.body['old_image'];
    }

    await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image,
    }).exec();

    req.session.message = {
      type: 'success',
      message: 'User Updated!',
    };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.json({ message: err.message, type: 'danger' });
  }
});
//delete user router
router.get('/delete/:id', (req, res) => {
  let id = req.params.id;
  User.findOneAndDelete({_id: id}).exec()
    .then(result => {
      if (result.image !== '') {
        try {
          fs.unlinkSync('./uploads/' + result.image);
        } catch (error) {
          console.log(error);
        }
      }
      req.session.message = {
        type: 'success',
        message: 'User deleted!'
      };
      res.redirect('/');
    })
    .catch(err => {
      res.json({message: err.message});
    });
});


module.exports = router;
