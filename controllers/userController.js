const db = require('../models');
const { User } = db;
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

// Cookie Configuration (matches your existing setup)
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 //7 Days
};

// Helper function to get safe user data (matches your existing pattern)
const getSafeUserData = (user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    profilePicture: user.profilePicture,
    role: user.role,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
});

module.exports = {
    updateUserData: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { firstName, lastName, email, phoneNumber, shippingAddress } = req.body;

            // Validation (matches your error handling style)
            if (!firstName || !lastName || !email) {
                console.error('❌ [ERROR] Profile update: Missing required fields'.red.bold);
                return res.status(400).json({
                    success: false,
                    message: 'First name, last name, and email are required'
                });
            }

            // Check email uniqueness if changed
            if (email !== req.user.email) {
                const emailExists = await User.findOne({ where: { email } });
                if (emailExists) {
                    console.error('❌ [ERROR] Profile update: Email already in use'.red.bold);
                    return res.status(400).json({
                        success: false,
                        message: 'Email already in use'
                    });
                }
            }

            // Update user (using your existing User model pattern)
            const [updated] = await User.update({
                firstName,
                lastName,
                email,
                phoneNumber,
                shippingAddress
            }, {
                where: { id: userId },
                returning: true
            });

            if (!updated) {
                console.error('❌ [ERROR] Profile update: User not found'.red.bold);
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const updatedUser = await User.findByPk(userId);

            console.log('✅ User profile data updated successfully'.green.bold);
            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                user: getSafeUserData(updatedUser)
            });

        } catch (error) {
            console.error('❌ [ERROR] Profile update error:'.red.bold, error);
            next(error);
        }
    },

    updatePassword: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            // Validation (matches your style)
            if (!currentPassword || !newPassword) {
                console.error('❌ [ERROR] Password update: Missing fields'.red.bold);
                return res.status(400).json({
                    success: false,
                    message: 'Current and new password are required'
                });
            }

            // Verify current password (using your existing method)
            const user = await User.unscoped().findByPk(userId);
            if (!user || !(await user.isValidPassword(currentPassword))) {
                console.error('❌ [ERROR] Password update: Invalid current password'.red.bold);
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Update password (following your existing pattern)
            user.password = newPassword;
            await user.save();

            console.log('✅ Password updated successfully'.green.bold);
            return res.status(200).json({
                success: true,
                message: 'Password updated successfully'
            });

        } catch (error) {
            console.error('❌ [ERROR] Password update error:'.red.bold, error);
            next(error);
        }
    },

    updateProfileImage: async (req, res, next) => {
        try {
            const userId = req.user.id;

            if (!req.file) {
                console.error('❌ [ERROR] Image update: No file provided'.red.bold);
                return res.status(400).json({
                    success: false,
                    message: 'No image file provided'
                });
            }

            // Get user and current image (following your pattern)
            const user = await User.findByPk(userId);
            const oldImage = user.profilePicture;

            // Update with new image
            user.profilePicture = req.file.filename;
            await user.save();

            // Delete old image if it exists (matches your resource handling)
            if (oldImage && oldImage !== 'default.png') {
                try {
                    const oldImagePath = path.join(
                        __dirname,
                        '../../public/uploads/profile',
                        oldImage
                    );
                    await unlinkAsync(oldImagePath);
                } catch (err) {
                    console.error('⚠️ [WARNING] Error deleting old image:'.yellow, err);
                }
            }

            // Construct image URL (following your existing URL pattern)
            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profile/${req.file.filename}`;

            console.log('✅ Profile image updated successfully'.green.bold);
            return res.status(200).json({
                success: true,
                message: 'Profile image updated',
                profilePicture: req.file.filename,
                imageUrl
            });

        } catch (error) {
            console.error('❌ [ERROR] Image update error:'.red.bold, error);
            next(error);
        }
    },

    getProfile: async (req, res, next) => {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: { exclude: ['password', 'refreshToken'] }
            });

            if (!user) {
                console.error('❌ [ERROR] Get profile: User not found'.red.bold);
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            console.log('✅ Retrieved user profile'.green.bold);
            res.status(200).json({
                success: true,
                user: getSafeUserData(user)
            });

        } catch (error) {
            console.error('❌ [ERROR] Get profile error:'.red.bold, error);
            next(error);
        }
    }
};