const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const MySchema = require('./models/model');  // Import the User model
const authenticateUser = require('./fingerprintAuth'); // Include webauth.js


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
app.post('/users/add-user', checkDuplication, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { username, email, password } = req.body;

    // Check if both username and email exist in the same row in the Employee collection
    const existingEmployee = await MySchema.Employee.findOne({ username, email });

    if (!existingEmployee) {
      console.log('Employee not found:', existingEmployee);
      return res.status(400).json({
        message: 'Employee with this email or username not registered',
        status: 400,
        employee: existingEmployee
      });
    }

    const employeeid = existingEmployee.employeeid;
    const role = existingEmployee.role;
    console.log('Employee found:', existingEmployee);

    const newUser = new MySchema.User({ employeeid, role, username, email, password });
    await newUser.save();
    console.log('User saved:', newUser);
    res.status(201).json({
      message: 'User registered successfully',
      status: '201',
      user: newUser
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Failed to register user', status: 500, error: err });
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

      var { employeeid, username, firstname, lastname, email, phone, address, state, city, zipcode, role, passkey } = req.body;

      // Parse the passkey JSON string back into an object
      const passkeyData = JSON.parse(passkey);

      // console.log('Request body:', req.body);

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
      const newEmployee = new MySchema.Employee({ employeeid, username,  firstname, lastname, email, phone, address, state, city, zipcode, role, image});
      await newEmployee.save();
      var {employeeid, fmt, counter, aaguid, credentialID, credentialPublicKey, credentialType, attestationObject, userVerified, credentialDeviceType, credentialBackedUp, origin, rpID } = passkeyData;

      const newPasskey = new MySchema.Passkeys({employeeid, fmt, counter, aaguid, credentialID, credentialPublicKey, credentialType, attestationObject, userVerified, credentialDeviceType, credentialBackedUp, origin, rpID });
      await newPasskey.save();
      res.status(201).json({
          message: 'Employee and Passkey added successfully',
          status: 201,
          employee: newEmployee,
          passkey: newPasskey
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



// Middleware to check the difference between coming and outgoing time
const checkWorkingTime = async (req, res, next) => {
  const { employeeid } = req.body;

  try {
    // Find existing attendance for the employee today
    const existingAttendance = await MySchema.Attendence.findOne({
      employeeid,
      coming: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) }
    });

    if (existingAttendance) {
      const comingTime = new Date(existingAttendance.coming); // Existing coming time
      const currentTime = new Date(); // Current time

      // Calculate the time difference in seconds
      const timeDiffInSeconds = (currentTime - comingTime) / 1000;

      // If the time difference is less than 10 seconds, return an error
      if (timeDiffInSeconds < 10) {
        return res.status(409).json({
          message: 'Cannot mark outgoing attendance before completing 10 seconds of working time',
          status: '409',
          attendance: existingAttendance
        });
      }

      // If the time difference is sufficient, proceed with marking outgoing
      req.existingAttendance = existingAttendance;
      return next();
    }

    // If no existing attendance, proceed to the next middleware or route
    next();

  } catch (err) {
    res.status(500).json({
      message: 'Failed to check working time',
      status: '500',
      error: err
    });
  }
};


// employee-attendence
app.post('/employee/attendence', checkWorkingTime, async (req, res) => {

  try {
    const { employeeid, username, email, role, biomarticVarificationCheckout } = req.body;

    // If there's existing attendance, update the outgoing time
    if (req.existingAttendance) {
      const currentTime = new Date(); // Get the current time as a full Date object
      req.existingAttendance.outgoing = currentTime; // Assign the Date object to outgoing
      await req.existingAttendance.save();

      return res.status(200).json({
        message: 'Outgoing attendance marked successfully',
        status: '200',
        attendance: req.existingAttendance
      });
    }

    // If there's no existing attendance, mark coming attendance
    const coming = new Date(); // Current time for coming
    const newAttendance = new MySchema.Attendence({ employeeid, username, email, role, coming, biomarticVarificationCheckout });
    await newAttendance.save();

    res.status(201).json({
      message: 'Employee coming attendance marked successfully',
      status: '201',
      attendance: newAttendance
    });

  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({
      message: 'Failed to mark attendance',
      status: '500',
      error: err
    });
  }
});



// employee-statistics
app.get('/employee/statistics', async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date().setHours(23, 59, 59, 999); // End of today

    // Get total number of employees
    const totalEmployees = await MySchema.Employee.countDocuments();

    // Get total attendances for today
    const totalAttendances = await MySchema.Attendence.countDocuments({
      coming: { $gte: today, $lt: tomorrow }
    });

    // Get total employees per role
    const roleCounts = await MySchema.Employee.aggregate([
      { $match: { is_deleted: 0 } },
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // Get today's attendance per role
    const attendanceRoleCounts = await MySchema.Attendence.aggregate([
      { $match: { coming: { $gte: today, $lt: tomorrow } } },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeid',
          foreignField: 'employeeid',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      { $group: { _id: '$employee.role', count: { $sum: 1 } } }
    ]);

    // Convert to key-value map
    const totalRoleCounts = {};
    roleCounts.forEach(role => {
      totalRoleCounts[role._id] = role.count;
    });

    const presentRoleCounts = {};
    attendanceRoleCounts.forEach(role => {
      presentRoleCounts[role._id] = role.count;
    });

    // Calculate absent counts
    const absentRoleCounts = {};
    Object.keys(totalRoleCounts).forEach(role => {
      absentRoleCounts[role] = totalRoleCounts[role] - (presentRoleCounts[role] || 0);
    });

    // Total absent employees
    const totalAbsent = totalEmployees - totalAttendances;

    res.status(200).json({
      message: 'Statistics retrieved successfully',
      status: '200',
      total: {
        totalEmployees,
        totalRoleCounts
      },
      present: {
        totalPresent: totalAttendances,
        presentRoleCounts
      },
      absent: {
        totalAbsent,
        absentRoleCounts
      }
    });

  } catch (err) {
    console.error('Error retrieving statistics:', err);
    res.status(500).json({
      message: 'Failed to retrieve statistics',
      status: '500',
      error: err
    });
  }
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });