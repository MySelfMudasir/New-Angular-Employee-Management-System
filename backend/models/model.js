const { booleanAttribute } = require('@angular/core');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  employeeid: { type: String, required: true, unique: true }, // Ensure usernames are unique.
  username: { type: String, required: true, unique: true }, // Ensure usernames are unique.
  email: { type: String, required: true, unique: true }, // Ensure email is unique
  password: { type: String, required: true }, // Consider hashing passwords in real-world applications
  role: { type: String, required: true }, // Ensure role is either 'user' or 'admin'
  is_deleted: { type: Number, default: 0 }
});


const employeeSchema = new mongoose.Schema({
  employeeid: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true},
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  zipcode: { type: Number, required: true },
  role: { type: String, required: true },
  image: { type: String, required: false },
  is_deleted: { type: Number, default: 0 }
});


const passkeySchema = new mongoose.Schema({
  employeeid: { type: String, required: true, unique: true },
  fmt: { type: String, required: true },
  counter: { type: String, required: true },
  aaguid: { type: String, required: true },
  credentialID: { type: String, required: true },
  credentialPublicKey: { type: Object, required: true },
  credentialType: { type: String, required: true },
  attestationObject: { type: Object, required: true },
  userVerified: { type: String, required: true },
  credentialDeviceType: { type: String, required: true },
  credentialBackedUp: { type: String, required: true },
  origin: { type: String, required: true },
  rpID: { type: String, required: true },
});



const attendenceschema = new mongoose.Schema({
  employeeid: { type: String, required: true },
  username: { type: String, required: true},
  email: { type: String, required: true },
  coming: {type: Date, required: false},
  outgoing: {type: Date, required: false},
  biomarticVarificationCheckout: {type: Boolean, required: true},
})

const User = mongoose.model('User', userSchema);
const Employee = mongoose.model('Employee', employeeSchema);
const Passkeys = mongoose.model('passkeys', passkeySchema)
const Attendence = mongoose.model('Attendence', attendenceschema)
module.exports = { User, Employee, Passkeys, Attendence };