const User = require("../models/User");
const bcrypt = require("bcryptjs");
const OTP= require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const { sendMail,sendOTPEmail } = require("./sendMail");

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if(await User.findOne({ email })) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const emailSubject = "Welcome to Notes App!";
    const emailText = `Hi ${name},\n\nThank you for signing up for Notes App! We're excited to have you on board.\n\nYou can now start creating and managing your notes.\n\nBest regards,\nNotes App Team`;
    const emailHtml = `
      <h2>Welcome to Notes App!</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for signing up for Notes App! We're excited to have you on board.</p>
      <p>You can now start creating and managing your notes.</p>
      <br>
      <p>Best regards,<br>Notes App Team: Chirag Katkoriya</p>
    `;

    sendMail(email, emailSubject, emailText, emailHtml)
      .then(result => {
        if (result.success) 
          {
          console.log("Welcome email sent to:", email);
          console.log("Preview URL:", result.previewUrl);
        } else {
          console.error("Failed to send welcome email:", result.error);
        }
      })
      .catch(err => console.error("Email error:", err));

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
};

const sendSignupOTP=async(req,res)=>{
  try{
    const {name,email,password}=req.body;

    if(!name || !email || !password)
      return res.status(400).json({message:"All fields are required"});

    const existingUser= await User.findOne({email});
    if(existingUser)
      return res.status(400).json({message:"User with this email already exists"});

    await OTP.deleteMany({email});

    const otp= otpGenerator.generate(6,{
      digits:true,
      upperCaseAlphabets:false,
      lowerCaseAlphabets:false,
      specialChars:false});

      await OTP.create({email,otp});

      const emailResult=await sendOTPEmail(email,otp,name);

      if(emailResult.success){
        res.status(200).json({
          message:"OTP sent to email",
          email:email
        });
      }
      else{
        res.status(500).json({message:"Error sending OTP email", error: emailResult.error});
      }
    }
    catch(error){
      res.status(500).json({message:"Internal server error", error: error.message});
    }
  }
exports.sendSignupOTP=sendSignupOTP;

exports.verifySignupOTP=async(req,res)=>{
  try{
    const {email,otp}=req.body;

    
    if(!email || !otp)
      return res.status(400).json({message:"Email and OTP are required"});
    const otpRecord= await OTP.findOne({email,otp});

    if(!otpRecord)
      return res.status(400).json({message:"Invalid OTP or email"});

    await OTP.deleteMany({email});

    res.status(200).json({message:"OTP verified successfully"});

  }
  catch(error){
    res.status(500).json({message:"Internal server error", error: error.message});
  }
}