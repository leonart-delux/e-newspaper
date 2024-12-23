import db from "../utils/db.js";

export default {
    getTagListFromAnArticle(articleId) {
        //Only get tag_name
        return db('articles_tags').where('article_id', articleId)
            .join('tags', 'articles_tags.tag_id', 'tags.id')
            .select('name', 'articles_tags.tag_id');
    },
    getTagNameById(tagId) {
        return db('tags').where('id', tagId).select('name as tagName').first();
    },

    getAllTags() {
        return db('tags').select('*');
    },


    // Đã thêm transaction
    async deleteTag(tagId) {
        const trx = await db.transaction();
        try {
            const deleteQueries = [
                {table: 'tags', condition: {id: tagId}},
            ];

            for (const {table, condition} of deleteQueries) {
                const ret = await db(table).where(condition).first();
                if (ret) {
                    const result = await trx(table).where(condition).delete();
                    if (!result) {
                        throw new Error(`Failed to delete from ${table}, tag ID: ${tagId}`);
                    }
                }
            }
            trx.commit();
            return true;
        } catch (e) {
            trx.rollback();
            console.log('Failed to delete from tagService-deleteTag');
            return false;
        } finally {
            await trx.destroy();
        }
    },

    updateTag(tagId, entity) {
        return db('tags').where('id', tagId).update(entity);
    },
    addTag(entity) {
        return db('tags').insert(entity);
    },


};