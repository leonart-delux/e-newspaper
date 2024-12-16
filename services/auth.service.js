import db from "../utils/db.js";

export default {
    add(entity) {
        return db("users").insert(entity);
    },

    findByEmail(email) {
        return db("users").where("email", email).first();
    }
};
