const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const MySchema = require('./models/model');  // Import the User model
// const authenticateUser = require('./webauth'); // Include webauth.js


const { log } = require('@angular-devkit/build-angular/src/builders/ssr-dev-server');


const app =  express();
const SECRET_KEY = 'your-secret-key';
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));


// connect to MongoDB
mongoose.connect('mongodb://localhost:27017/temp')
.then(() => console.log('Connected to MongoDB'))
.catch(error => console.error(error))




// Configure Multer and Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: './uploads', // Folder where images will be stored
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});




const upload = multer({ storage: storage });
// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));





// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Get the token from Authorization header
  if (!token) {
    return res.status(403).json({ message: 'Access denied, no token provided' });
  }
  // Verify the token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    // Token is valid, attach the decoded payload to the request
    req.user = decoded;
    next(); // Continue to the next middleware or route handler
  });
};



const checkRegisteredEmployee = (req, res, next) => {
  const { username, email } = req.body;  
  MySchema.Employee.findOne({ username, email, is_deleted: 0 })
    .then(user => {      
      if (user) {
        console.log('Employee found:', user);
        return res.status(409).json({
          message: 'Employee already exists',
          status: '409',
        });
      } else {
        console.log('Employee not found:', user);
        next(); // Continue to the next middleware or route handler
      }
    })
    .catch(err => {
      console.error('Error checking employee:', err);
      res.status(500).json({
        message: 'Failed to check employee',
        status: '500',
        error: err
      });
    });
};


const checkDuplication = (req, res, next) => {
  const { username, email } = req.body
  MySchema.User.findOne({ username, email })
    .then(user => {
      if (user) {
        console.log('User found:', user);
        return res.status(409).json({
          message: 'User already exists',
          status: '409',
        });
      } else {
        console.log('User not found:', user);
        next(); // Continue to the next middleware or route handler
      }
    })
    .catch(err => {
      console.error('Error checking user:', err);
      res.status(500).json({
        message: 'Failed to check user',
        status: '500',
        error: err
      });
    });
};






// add user
app.post('/users/add-user', checkDuplication, async(req, res) => {
  try {
    console.log('Request body:', req.body);
    // const employeeid = `employee_${Date.now()}`;
    const { username, email, password } = req.body;


    const existingEmployee = await MySchema.Employee.findOne({
      $or: [
      { username: username },
      { email: email }]
    });

    if (!existingEmployee) {
      console.log('Employee not found:', existingEmployee);
      
      return res.status(400).json({
        message: 'Employee with this email or username not registered',
        status: 400,
        employee: existingEmployee
      });
    }


    employeeid = existingEmployee.employeeid;
    role = existingEmployee.role;
    console.log('Employee found:', existingEmployee);
    
    const newUser = new MySchema.User({ employeeid, role, username, email, password });
    newUser.save()
    .then(user => {
      console.log('User saved:', user);
      res.status(201).json({
        message: 'User Register successfully',
        status: '201',
        user: user
      });
    })
    .catch(err => {
      console.error('Error saving user:', err); // Log errors
      res.status(500).json({
        message: 'Failed to add user',
        status: '500',
        error: err
      });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Failed to Register user', status: 500, error: err });
  }

});





// validate-user
app.post('/users/validate-user', (req, res) => {
console.log('Request body:', req.body);
res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins (can be restricted)
const { username, password } = req.body;
MySchema.User.findOne({ username, password })
  .then(user => {
    if (user) {
      console.log('User found:', user);
      const token = jwt.sign({ username, password }, SECRET_KEY, { expiresIn: '1h' });
      res.status(200).json({
        message: 'User found successfully',
        status: '200',
        employeeId: user.employeeid,
        employeeUsername: user.username,
        employeeEmail: user.email,
        employeeRole: user.role,
        token: token
      });
    } else {
      console.log('User not found');
      res.status(404).json({
        message: 'User not found',
        status: '404'
      });
    }
  })
  .catch(err => {
    console.error('Error validating user:', err);
    res.status(500).json({
      message: 'Failed to validate user',
      status: '500',
      error: err
    });
  });
});





// API to add an employee with an image
app.post('/employee/add-employee', upload.single('image'), async (req, res) => {  
  try {
      const { employeeid, username, firstname, lastname, email, phone, address, state, city, zipcode, role } = req.body;

      // Check for duplicate email or employeeid
      const existingEmployee = await MySchema.Employee.findOne({
        $or: [
          { employeeid: employeeid },
          { username: username },
          { email: email }]
      });

      if (existingEmployee) {
        return res.status(400).json({
            message: 'Employee with this email or employee ID already exists',
            status: 400
        });
      }

      const image = req.file ? req.file.path : null;
      const newEmployee = new MySchema.Employee({
          employeeid,
          username, 
          firstname,
          lastname,
          email,
          phone,
          address,
          state,
          city,
          zipcode,
          role,
          image,
      });
      await newEmployee.save();
      res.status(201).json({
          message: 'Employee added successfully',
          status: 201,
          employee: newEmployee
      });
  } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Failed to add employee', status: 500, error: err });
  }
});





// view-employee
app.get('/employee/view-employee', (req, res) => {
  MySchema.Employee.find()
    .then(employees => {
      console.log('Employees retrieved:', employees);
      res.status(200).json({
        message: 'Employees retrieved successfully',
        status: '200',
        employees: employees,
      });
    })
    .catch(err => {
      console.error('Error retrieving employees:', err);
      res.status(500).json({
        message: 'Failed to retrieve employees',
        status: '500',
        error: err
      });
    });
});




// get-employee with id
app.get('/employee/get-employee/:id', (req, res) => {
  const id = req.params.id;
  MySchema.Employee.findById(id)
    .then(employee => {
      if (employee) {
        console.log('Employee found:', employee);
        res.status(200).json({
          message: 'Employee found successfully',
          status: '200',
          employee: employee
        });
      } else {
        console.log('Employee not found');
        res.status(404).json({
          message: 'Employee not found',
          status: '404'
        });
      }
    })
    .catch(err => {
      console.error('Error retrieving employee:', err);
      res.status(500).json({
        message: 'Failed to retrieve employee',
        status: '500',
        error: err
      });
    });
});




// update-Employee with id
app.put('/employee/update-employee/:id', upload.single('image'), async (req, res) => {
  const id = req.params.id;
  console.log(id);
  console.log(req.body);

  const { employeeid, username, firstname, lastname, email, phone, address, state, city, zipcode, role } = req.body;
  const image = req.file ? req.file.path : null;

  const updateData = { employeeid, username, firstname, lastname, email, phone, address, state, city, zipcode, role };
  if (image) {
    updateData.image = image;
  }

  try {
    const employee = await MySchema.Employee.findByIdAndUpdate(id, updateData, { new: true });
    if (employee) {
      console.log('Employee updated:', employee);
      res.status(200).json({
        message: 'Employee updated successfully',
        status: '200',
        employee: employee
      });
    } else {
      console.log('Employee not found');
      res.status(404).json({
        message: 'Employee not found',
        status: '404'
      });
    }
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({
      message: 'Failed to update employee',
      status: '500',
      error: err
    });
  }
});




// delete-employee
app.delete('/employee/delete-employee/:id', (req, res) => {
  const id = req.params.id;
  MySchema.Employee.findByIdAndDelete(id)
    .then(employee => {
      if (employee) {
        console.log('Employee deleted:', employee);
        res.status(200).json({
          message: 'Employee deleted successfully',
          status: '200',
          employee: employee
        });
      } else {
        console.log('Employee not found');
        res.status(404).json({
          message: 'Employee not found',
          status: '404'
        });
      }
    })
    .catch(err => {
      console.error('Error deleting employee:', err);
      res.status(500).json({
        message: 'Failed to delete employee',
        status: '500',
        error: err
      });
    });
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });