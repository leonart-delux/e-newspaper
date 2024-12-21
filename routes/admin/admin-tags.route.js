import express from "express";
import tagService from "../../services/tagService.js";

const router = express.Router();

router.get('/', async function (req, res) {
    const tags = await tagService.getAllTags();
    const added = req.session.tagAdded;
    const edited = req.session.tagEdited;
    const deleted = req.session.tagDeleted;

    if ((added === undefined || added === null)
        && (edited === undefined || edited === null)
        && (deleted === undefined || deleted == null)) {
        res.render('vwAdmin/tags/tags-menu', {
            layout: 'admin',
            tags: true,
            tagList: tags,
        });
    } else if (added) {
        res.render('vwAdmin/tags/tags-menu', {
            layout: 'admin',
            tags: true,
            tagList: tags,
            added: true,

        });
    } else if (edited) {
        res.render('vwAdmin/tags/tags-menu', {
            layout: 'admin',
            tags: true,
            tagList: tags,
            edited: true,

        });
    } else if (deleted) {
        res.render('vwAdmin/tags/tags-menu', {
            layout: 'admin',
            tags: true,
            tagList: tags,
            deleted: true,
        });
    }
    req.session.tagAdded = null;
    req.session.tagEdited = null;
    req.session.tagDeleted = null;
});

router.post('/delete', async function (req, res) {
    const deletedTagId = req.body.tagIdDeleted || null;
    if (deletedTagId <= 0 || deletedTagId === null) {
        req.session.tagDeleted = false;
        res.redirect('/admin/tags');
    }
    const ret = await tagService.deleteTag(deletedTagId);
    if (ret) {
        req.session.tagDeleted = true;
    }
    res.redirect('/admin/tags');

});

router.post('/edit', async function (req, res) {
    const editedTagId = req.body.tagIdEdited || null;

    if (editedTagId <= 0 || editedTagId === null) {
        req.session.tagEdited = false;
        res.redirect('/admin/tags');
    }

    const ret = await tagService.updateTag(editedTagId, {name: req.body.tagNameEdited})

    if (ret) {
        req.session.tagEdited = true;
    }
    res.redirect('/admin/tags');
});

router.post('/add', async function (req, res) {

    const ret = await tagService.addTag({name: req.body.tagName})
    if (ret) {
        req.session.tagAdded = true;
    } else {
        req.session.tagAdded = false;
    }
    res.redirect('/admin/tags');
});

export default router;