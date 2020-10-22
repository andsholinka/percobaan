import Doc from './../models/doc.js';
import express from 'express';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import Conf from '../config.js';

var docRouter = express.Router();

docRouter.use(bodyParser.urlencoded({ extended: false }));
docRouter.use(bodyParser.json());

//CREATE doc
docRouter.post('/create', async (req,res) => {
    try {
        const {kategori, nomer, redaksi, tujuan, tanggal, status} = req.body;

        const doc = new Doc({
            kategori,
            nomer,
            tujuan,
            redaksi,
            tanggal,
            status,
        });

        const createDoc = await doc.save();

        res.status(201).json(createDoc);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Doc creation failed'});
    }
});

//READ all data users
docRouter.get('/all', async (req,res) => {
    const doc =  await Doc.find({});

    if(doc && doc.length !== 0) {
        res.json(doc)
    } else {
        res.status(404).json({
            message: 'Doc not found'
        });
    }
});

//READ user by ID
docRouter.get('/all/:id', async (req,res) => {
    const doc = await Doc.findById(req.params.id);

    if(doc) {
        res.json(doc)
    } else {
        res.status(404).json({
            message: 'Doc not found'
        });
    }
});

// Konfirmasi surat
docRouter.put('/all/update/:id', function (req, res) {
    //header apabila akan melakukan akses
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        const jabatan = decoded.user.jabatan;
            if( jabatan == '0'){
                const {status} = req.body;
                const doc = await Doc.findById(req.params.id);
                if (doc) {
                    doc.status = status;
                    const updateStatus = await doc.save()

                    res.send(updateStatus);
                } else {
                    res.status(500).send(`${decoded.user.username} Tidak Memiliki Wewenang`);
                }
            } else {
                const {kategori, nomer, redaksi, tujuan, tanggal} = req.body;
                const doc = await Doc.findById(req.params.id);

                if (doc) {

                    doc.kategori = kategori;
                    doc.nomer = nomer;
                    doc.redaksi = redaksi;
                    doc.tanggal = tanggal
                    doc.tujuan = tujuan;
            
                    const updateDatadoc = await doc.save()
            
                    res.send(updateDatadoc);

                } else {
                    res.status(500).send(`${decoded.user.username} Tidak Memiliki Wewenang`);
                }
            }
        })
    });

export default docRouter;