import z from "zod";

export const EmailSchema = z.email("Invalid email address.");
export const PasswordSchema = z.string()
    .min(6, "Password must be at least 6 characters long.")
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/,
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*#?&).",
    );
