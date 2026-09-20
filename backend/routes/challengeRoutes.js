const express = require("express");

const {
    getChallenges,
    getChallengeById,
    createChallenge,
    updateChallenge,
    deleteChallenge
} = require("../controllers/challengeController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


// GET all challenges
router.get(
    "/",
    authenticate,
    getChallenges
);


// GET one challenge
router.get(
    "/:id",
    authenticate,
    getChallengeById
);


// CREATE challenge - Government only
router.post(
    "/",
    authenticate,
    authorize("GOVERNMENT"),
    createChallenge
);


// UPDATE challenge - Government only
router.put(
    "/:id",
    authenticate,
    authorize("GOVERNMENT"),
    updateChallenge
);


// DELETE challenge - Government only
router.delete(
    "/:id",
    authenticate,
    authorize("GOVERNMENT"),
    deleteChallenge
);


module.exports = router;