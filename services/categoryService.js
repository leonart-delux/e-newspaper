import db from "../utils/db.js";

export default {
    getAllCategories() {
        return db('categories').select('*');
    },
    getChildCategories(catId) {
        return db('categories').where('parent_id', catId);
    },
    getCategory(catId) {
        return db('categories').where('id', catId).first();
    },
    getCategoryListFromAnArticle(articleId) {
        //Only get category_name
        return db('articles_categories').where('article_id', articleId)
            .join('categories', 'articles_categories.category_id', 'categories.id')
            .select('name', 'articles_categories.category_id');
    },

    async getAllCategoriesAndItsChildCat() {
        const categories = await this.getAllCategories();

        //Sử dụng map thay vì forEach do:
        //forEach không chờ đợi từ promise xong rồi chạy tiếp, map thì có
        // map cho phép dùng Promise.all để chờ đợi tất cả các promise hoàn thành rồi mới tiếp tục thực hiện cviec tiếp theo
        const promises = categories.map(async (category) => {
            const childCats = await this.getChildCategories(category.id);
            category.childCats = childCats;
            return category;
        });
        return await Promise.all(promises);
    },
    addChildCatToACategory(childId, entity) {
        return db('categories').where('id', childId).update(entity);
    },


    async addCategories(categoryName, childCats) {
        let newCat = null;
        try {
            newCat = await db('categories').insert({name: categoryName});
        } catch (error) {
            return false;
        }

        console.log(childCats);
        childCats = childCats.split(',');
        const childCatRet = await Promise.all(childCats.map(async (childCat) => {
                console.log(`child:${childCat}`);
                const entity = {
                    parent_id: newCat,
                };
                await this.addChildCatToACategory(childCat, entity);
            }
        ));

        if (childCats === null) {
            return newCat !== null;
        }
        return newCat !== null && childCatRet !== null;
    },

    //Delete category and set null at its child category's parent_id
    async deleteCategory(catId) {
        const childCats = await this.getChildCategories(catId);

        try {
            if (childCats.length!==0) {
                const childCatRet = await Promise.all(childCats.map(async (childCat) => {
                        const entity = {
                            parent_id: null,
                        };
                        await this.addChildCatToACategory(childCat.id, entity);
                    }
                ));
            }
        } catch (e) {
            return false;
        }
        const result =await db('categories').where('id', catId).delete();
        if (result) {
            return true;
        }
        return false;

    }


}