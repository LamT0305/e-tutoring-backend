import Role from "../models/role.model.js"
export const createRole = async (req, res) => {
    try {
        const { role_name } = req.body; 
        const newRole = new Role({ role_name }); 
        await newRole.save(); 
        return res.status(201).json(newRole); 
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

export const getAllRoles = async(req, res)=>{
    try {
        const roles = await Role.find()
        res.status(200).json({message: "success", roles: roles});
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getRoleById = async(req, res)=>{
    try {
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({message:"Role not found"})
        }
        res.status(200).json({ status: 'success', role: role });
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

