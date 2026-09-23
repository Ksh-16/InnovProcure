import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import API from "../services/api";

function Departments() {

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [editingDepartment, setEditingDepartment] = useState(null);

    const [departmentName, setDepartmentName] = useState("");

    const [saving, setSaving] = useState(false);


    // ==========================================
    // FETCH DEPARTMENTS
    // ==========================================

    const fetchDepartments = async () => {

        try {

            const response = await API.get("/departments");

            setDepartments(response.data.departments || []);

        } catch (error) {

            console.error(
                "Error fetching departments:",
                error
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        fetchDepartments();

    }, []);


    // ==========================================
    // OPEN CREATE MODAL
    // ==========================================

    const openCreateModal = () => {

        setEditingDepartment(null);

        setDepartmentName("");

        setShowModal(true);
    };


    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================

    const openEditModal = (department) => {

        setEditingDepartment(department);

        setDepartmentName(
            department.department_name
        );

        setShowModal(true);
    };


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const closeModal = () => {

        setShowModal(false);

        setEditingDepartment(null);

        setDepartmentName("");
    };


    // ==========================================
    // SAVE DEPARTMENT
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!departmentName.trim()) {

            alert("Please enter a department name.");

            return;
        }

        try {

            setSaving(true);

            if (editingDepartment) {

                await API.put(
                    `/departments/${editingDepartment.id}`,
                    {
                        department_name: departmentName
                    }
                );

            } else {

                await API.post(
                    "/departments",
                    {
                        department_name: departmentName
                    }
                );
            }

            closeModal();

            fetchDepartments();

        } catch (error) {

            console.error(
                "Error saving department:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to save department."
            );

        } finally {

            setSaving(false);
        }
    };


    // ==========================================
    // DELETE DEPARTMENT
    // ==========================================

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this department?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await API.delete(
                `/departments/${id}`
            );

            fetchDepartments();

        } catch (error) {

            console.error(
                "Error deleting department:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete department."
            );
        }
    };


    return (
        <div className="page-container">

            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="page-header">

                <div>

                    <h1>Departments</h1>

                    <p>
                        Manage government departments participating
                        in innovation procurement.
                    </p>

                </div>

                <button
                    className="primary-button department-add-button"
                    onClick={openCreateModal}
                >
                    <Plus size={17} />
                    Add Department
                </button>

            </div>


            {/* ================================= */}
            {/* CONTENT */}
            {/* ================================= */}

            {loading ? (

                <div className="empty-state">

                    <p>
                        Loading departments...
                    </p>

                </div>

            ) : departments.length === 0 ? (

                <div className="empty-state">

                    <h3>
                        No departments yet
                    </h3>

                    <p>
                        Add your first government department
                        to start creating challenges.
                    </p>

                    <button
                        className="primary-button"
                        onClick={openCreateModal}
                    >
                        <Plus size={17} />
                        Add Department
                    </button>

                </div>

            ) : (

                <div className="department-grid">

                    {departments.map((department) => (

                        <div
                            className="department-card"
                            key={department.id}
                        >

                            <div className="department-card-top">

                                <div className="department-icon">
                                    {department.department_name
                                        ?.charAt(0)
                                        ?.toUpperCase()}
                                </div>

                                <div className="department-actions">

                                    <button
                                        onClick={() =>
                                            openEditModal(
                                                department
                                            )
                                        }
                                        title="Edit department"
                                    >
                                        <Pencil size={17} />
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                department.id
                                            )
                                        }
                                        title="Delete department"
                                    >
                                        <Trash2 size={17} />
                                    </button>

                                </div>

                            </div>


                            <h3>
                                {department.department_name}
                            </h3>

                            <p>
                                Department ID: #{department.id}
                            </p>

                        </div>

                    ))}

                </div>
            )}


            {/* ================================= */}
            {/* MODAL */}
            {/* ================================= */}

            {showModal && (

                <div
                    className="department-modal-overlay"
                    onClick={closeModal}
                >

                    <div
                        className="department-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="department-modal-header">

                            <div>

                                <h2>
                                    {editingDepartment
                                        ? "Edit Department"
                                        : "Add Department"}
                                </h2>

                                <p>
                                    {editingDepartment
                                        ? "Update department information."
                                        : "Create a government department."}
                                </p>

                            </div>

                            <button
                                onClick={closeModal}
                                className="modal-close-button"
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                        >

                            <label>
                                Department Name
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. Department of Innovation"
                                value={departmentName}
                                onChange={(e) =>
                                    setDepartmentName(
                                        e.target.value
                                    )
                                }
                            />


                            <div className="department-modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingDepartment
                                            ? "Update Department"
                                            : "Create Department"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Departments;