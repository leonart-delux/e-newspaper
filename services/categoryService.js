import db from "../utils/db.js";

export default {
    getAllCategories() {
        return db('categories').select('*');
    },
    getAllNonParentCategories() {
        return db('categories').where('parent_id', null).select('*');
    },

    getChildCategories(catId) {
        return db('categories').where('parent_id', catId).select('*');
    },

    getCategory(catId) {
        return db('categories').where('id', catId).first();
    },
    async getCategoryAndItsChildCat(catId) {
        const category = await this.getCategory(catId);

        const childCategories = await this.getChildCategories(catId);

        category.childCats = childCategories || null;
        return category;
    },
    getCategoryListFromAnArticle(articleId) {
        //Only get category_name
        return db('articles_categories').where('article_id', articleId)
            .join('categories', 'articles_categories.category_id', 'categories.id')
            .select('name', 'articles_categories.category_id');
    },


    async getCategoryTree() {
        const categories = await db('categories');

        // Loop 2 times to create category hierachy
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.id] = { ...cat, children: [] };
        });

        const tree = [];
        categories.forEach(cat => {
            if (cat.parent_id) {
                categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
            } else {
                tree.push(categoryMap[cat.id]);
            }
        });

        return tree;
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

    //Đã thêm transaction
    async addChildCatToACategory(childId, entity, trx) {
        return db('categories').where('id', childId).update(entity).transacting(trx);
    },

    //Đã thêm transaction
    async addCategories(categoryName, childCats) {
        let newCat = null;
        const trx = await db.transaction();
        try {
            newCat = await db('categories').insert({name: categoryName});
            if (!newCat) {
                throw new Error('Error in insert new category to db');
            }
            childCats = childCats.split(',');

            if (childCats.length > 0) {
                const updatePromises = childCats
                    .map(childCat => this.addChildCatToACategory(childCat, {parent_id: newCat}, trx));
                await Promise.all(updatePromises);
            }
            trx.commit();
            return true;
        } catch (error) {
            return false;
        }
    },

    //Đã thêm transaction
    async deleteCategory(catId) {
        const childCats = await this.getChildCategories(catId);
        const trx = await db.transaction();

        try {
            //Set null cho parent_id của tất cả child Cat con
            if (childCats.length > 0) {
                const updatePromises = childCats.map(childCat =>
                    this.addChildCatToACategory(childCat.id, {parent_id: null}, trx)
                );
                await Promise.all(updatePromises);
            }

            //Xóa 3 table lquan đến category trong db
            const deleteQueries = [
                {table: 'articles_categories', condition: {category_id: catId}},
                {table: 'editors_categories', condition: {category_id: catId}},
                {table: 'categories', condition: {id: catId}},
            ];

            for (const {table, condition} of deleteQueries) {
                const ret = await db(table).where(condition).first();
                if (ret) {
                    const result = await trx(table).where(condition).delete();
                    if (!result) {
                        throw new Error(`Failed to delete from ${table}, category ID: ${catId}`);
                    }
                }
            }

            //Nếu thực hiện thành công thì commit để db thực hiện
            await trx.commit();
            return true;
        } catch (e) {
            //Lỗi thì dừng việc thay đổi trong db (toàn bộ)
            await trx.rollback();
            console.error(`Transaction failed in deleteCategory, category ID: ${catId}`, e);
            return false;
        } finally {
            await trx.destroy();
        }
    },

    //Đã thêm transaction
    updateCategory(catId, entity, trx) {
        return db('categories').where('id', catId).update(entity).transacting(trx);
    },

    //Đã thêm transaction
    async updateCategoryAndItsChildCat(catId, newChildCats, newCatName) {
        //Ta có childCat cũ và mới
        //Để cập nhật được child cat, ta phải tìm ra những childCat bị bỏ (
        //childCats mới có thể
        const trx = await db.transaction();
        try {
            const oldChildCats = await this.getChildCategories(catId);
            if (oldChildCats.length > 0) {
                const updatePromises = oldChildCats.map((oldCat) => this.updateCategory(oldCat.id, {parent_id: null}, trx))
                await Promise.all(updatePromises);
            }
            if (newChildCats !== null) {
                newChildCats = newChildCats.split(',');
                if (newChildCats.length > 0) {
                    const updatePromises = newChildCats.map((newCat) => this.updateCategory(newCat, {parent_id: catId}, trx))
                    await Promise.all(updatePromises);
                }
            }

            const ret = await db('categories').where('id', catId).update({name: newCatName}).transacting(trx);
            if (!ret) {
                throw new Error("Error on updateCategoryAndItsChildCat:");
            }
            trx.commit();
            return true;
        } catch (e) {
            console.log('Error on updateCategoryAndItsChildCat: ', e)
            trx.rollback();
            return false;
        }
    },

    getTopViewCategories(amount) {
        return db('categories')
            .leftJoin('articles_categories', 'categories.id', 'articles_categories.category_id')
            .leftJoin('articles', 'articles.id', 'articles_categories.article_id')
            .select(
                'categories.id as category_id',
                'categories.name as category_name'
            )
            .sum('articles.view_count as total_views')
            .groupBy('categories.id', 'categories.name')
            .orderBy('total_views', 'desc')
            .limit(amount);
    }

};
