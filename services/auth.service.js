import db from "../utils/db.js";
import bcrypt from "bcryptjs";

export default {
    add(entity) {
        return db("users").insert(entity);
    },

    findByEmail(email) {
        return db("users").where("email", email).first();
    },

    updatePassword(email, newPassword) {
        newPassword = bcrypt.hashSync(newPassword, 8);
        return db("users").where("email", email).update({ password: newPassword });
    },
};
