"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHallsByEquipment = exports.getHallsByCapacity = exports.searchHalls = exports.deleteHall = exports.updateHall = exports.createHall = exports.getHallById = exports.getAllHalls = void 0;
const Hall_1 = __importDefault(require("@/models/Hall"));
const transformHall = (hall) => {
    return {
        id: hall._id.toString(),
        name: hall.name,
        capacity: hall.capacity,
        equipment: hall.equipment,
        imageUrl: hall.imageUrl,
        imageHint: hall.imageHint,
        createdAt: hall.createdAt,
        updatedAt: hall.updatedAt
    };
};
const getAllHalls = async (req, res) => {
    try {
        const { search, minCapacity, maxCapacity, equipment } = req.query;
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { equipment: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        if (minCapacity || maxCapacity) {
            query.capacity = {};
            if (minCapacity)
                query.capacity.$gte = parseInt(minCapacity);
            if (maxCapacity)
                query.capacity.$lte = parseInt(maxCapacity);
        }
        if (equipment) {
            const equipmentArray = equipment.split(',');
            query.equipment = { $all: equipmentArray };
        }
        const halls = await Hall_1.default.find(query).sort({ name: 1 });
        const transformedHalls = halls.map(transformHall);
        res.json({ halls: transformedHalls });
    }
    catch (error) {
        console.error('Get halls error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAllHalls = getAllHalls;
const getHallById = async (req, res) => {
    try {
        const { id } = req.params;
        const hall = await Hall_1.default.findById(id);
        if (!hall) {
            res.status(404).json({ error: 'Hall not found' });
            return;
        }
        res.json({ hall: transformHall(hall) });
    }
    catch (error) {
        console.error('Get hall error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getHallById = getHallById;
const createHall = async (req, res) => {
    try {
        const { name, capacity, equipment, imageUrl, imageHint } = req.body;
        const existingHall = await Hall_1.default.findOne({ name });
        if (existingHall) {
            res.status(409).json({ error: 'Hall with this name already exists' });
            return;
        }
        const hallData = {
            name,
            capacity,
            equipment,
            imageUrl: imageUrl || 'https://placehold.co/600x400.png'
        };
        if (imageHint) {
            hallData.imageHint = imageHint;
        }
        const hall = new Hall_1.default(hallData);
        await hall.save();
        res.status(201).json({
            message: 'Hall created successfully',
            hall: transformHall(hall)
        });
    }
    catch (error) {
        console.error('Create hall error:', error);
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.createHall = createHall;
const updateHall = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, capacity, equipment, imageUrl, imageHint } = req.body;
        if (name) {
            const existingHall = await Hall_1.default.findOne({ name, _id: { $ne: id } });
            if (existingHall) {
                res.status(409).json({ error: 'Hall with this name already exists' });
                return;
            }
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (capacity !== undefined)
            updateData.capacity = capacity;
        if (equipment !== undefined)
            updateData.equipment = equipment;
        if (imageUrl !== undefined)
            updateData.imageUrl = imageUrl;
        if (imageHint !== undefined)
            updateData.imageHint = imageHint;
        const hall = await Hall_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!hall) {
            res.status(404).json({ error: 'Hall not found' });
            return;
        }
        res.json({
            message: 'Hall updated successfully',
            hall: transformHall(hall)
        });
    }
    catch (error) {
        console.error('Update hall error:', error);
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.updateHall = updateHall;
const deleteHall = async (req, res) => {
    try {
        const { id } = req.params;
        const hall = await Hall_1.default.findByIdAndDelete(id);
        if (!hall) {
            res.status(404).json({ error: 'Hall not found' });
            return;
        }
        res.json({ message: 'Hall deleted successfully' });
    }
    catch (error) {
        console.error('Delete hall error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteHall = deleteHall;
const searchHalls = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            res.status(400).json({ error: 'Search query is required' });
            return;
        }
        const halls = await Hall_1.default.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { equipment: { $in: [new RegExp(q, 'i')] } }
            ]
        }).sort({ name: 1 });
        res.json({ halls: halls.map(transformHall) });
    }
    catch (error) {
        console.error('Search halls error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.searchHalls = searchHalls;
const getHallsByCapacity = async (req, res) => {
    try {
        const { min, max } = req.query;
        if (!min) {
            res.status(400).json({ error: 'Minimum capacity is required' });
            return;
        }
        const query = { capacity: { $gte: parseInt(min) } };
        if (max) {
            query.capacity.$lte = parseInt(max);
        }
        const halls = await Hall_1.default.find(query).sort({ capacity: 1 });
        res.json({ halls: halls.map(transformHall) });
    }
    catch (error) {
        console.error('Get halls by capacity error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getHallsByCapacity = getHallsByCapacity;
const getHallsByEquipment = async (req, res) => {
    try {
        const { equipment } = req.query;
        if (!equipment) {
            res.status(400).json({ error: 'Equipment list is required' });
            return;
        }
        const equipmentArray = equipment.split(',');
        const halls = await Hall_1.default.find({
            equipment: { $all: equipmentArray }
        }).sort({ name: 1 });
        res.json({ halls: halls.map(transformHall) });
    }
    catch (error) {
        console.error('Get halls by equipment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getHallsByEquipment = getHallsByEquipment;
//# sourceMappingURL=hallController.js.map