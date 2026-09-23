import CompanyModel from "../model/company.model.js";
import UserModel from "../model/user.model.js";
import { createTokenForUser } from "../service/authentication.js";
import getNextSequence from "../utils/counter.js";
import bcrypt from "bcrypt";


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }


    const user = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    });


    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const isPassEqual = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPassEqual) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    
    const company = await CompanyModel.findById(
      user.companyId
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }


    const jwtToken = createTokenForUser(user);


    return res.status(200).json({
      success: true,
      message: "Login Successfully",

      jwtToken,

      user: {
        id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyId: user.companyId,
      },

      company: {
        id: company._id,
        companyId: company.companyId,
        companyName: company.companyName,
        address: company.address,
        city: company.city,
        zipCode: company.zipCode,
        industry: company.industry,
        currencySymbol: company.currencySymbol,
      },
    });

  } catch (err) {
    console.error("Login Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      companyName,
      address,
      city,
      zipCode,
      industry,
      currencySymbol,
    } = req.body;

    
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !companyName ||
      !address ||
      !city ||
      !zipCode ||
      !industry ||
      !currencySymbol
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

  
    const existingUser = await UserModel.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists, please login",
      });
    }

    
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

   
    const companyId = await getNextSequence(
      "companyId"
    );

    const company = new CompanyModel({
      companyId,
      companyName,
      address,
      city,
      zipCode,
      industry,
      currencySymbol,
    });

    const savedCompany = await company.save();


    const userId = await getNextSequence("userId");

    const user = new UserModel({
      userId,
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,
      companyId: savedCompany._id,
    });

    await user.save();

  
    return res.status(201).json({
      success: true,
      message: "Signup Successfully",

      user: {
        id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyId: user.companyId,
      },

      company: {
        id: savedCompany._id,
        companyId: savedCompany.companyId,
        companyName: savedCompany.companyName,
        address: savedCompany.address,
        city: savedCompany.city,
        zipCode: savedCompany.zipCode,
        industry: savedCompany.industry,
        currencySymbol: savedCompany.currencySymbol,
      },
    });

  } catch (err) {
    console.error("Signup Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};