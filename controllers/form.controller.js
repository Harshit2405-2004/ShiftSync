const Form = require('../models/form.model');

// Create a new form
exports.createForm = async (req, res) => {
    try {
        const { title, content, shiftDate } = req.body;
        
        const form = new Form({
            title,
            content,
            shiftDate,
            createdBy: req.userId // Set owner from verified token
        });

        await form.save();
        res.status(201).send({ message: "Form created successfully!", data: form });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Retrieve all forms (for viewing/downloading)
exports.getAllForms = async (req, res) => {
    try {
        const forms = await Form.find().populate('createdBy', 'username role'); // Populate creator info
        res.status(200).send(forms);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Retrieve a single form by ID (for viewing/downloading)
exports.getFormById = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id).populate('createdBy', 'username role');
        if (!form) {
            return res.status(404).send({ message: "Form not found." });
        }
        res.status(200).send(form);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Update a form (only owner can do this)
exports.updateForm = async (req, res) => {
    try {
        const updatedForm = await Form.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).send({ message: "Form updated successfully!", data: updatedForm });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Delete a form (only owner can do this)
exports.deleteForm = async (req, res) => {
    try {
        await Form.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: "Form deleted successfully." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
