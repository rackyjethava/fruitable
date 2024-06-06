import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { object, string } from 'yup';
import { useFormik } from 'formik';
import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

export default function Category() {
    const [open, setOpen] = useState(false);
    const [categorydata, setdata] = useState([]);
    const [editing, setEditing] = useState(null);

    const contectSchema = object({
        name: string().required(),
        description: string().required().min(10),
    });

    const getdata = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/v1/categories/list-categories");
            setdata(response.data.data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getdata();
    }, [])

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
        },
        validationSchema: contectSchema,
        onSubmit: (values, { resetForm }) => {
            if (editing) {
                handleUpdate(values);
            } else {
                handleAdd(values);
            }
            resetForm();
            handleClose();
        },
    });

    const { handleSubmit, handleChange, handleBlur, values, touched, errors } = formik;

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        formik.resetForm();
        setEditing(null);
    };

    const handleAdd = async (data) => {
        try {
            await axios.post("http://localhost:8000/api/v1/categories/add-category", data, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            getdata();
        } catch (error) {
            console.error(error);
        }
    }

    const handleDelete = async (data) => {
        try {
            await axios.delete(`http://localhost:8000/api/v1/categories/delete-category/${data._id}`);
            getdata();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (data) => {
        formik.setValues(data);
        setOpen(true);
        setEditing(data);
    }

    const handleUpdate = async (data) => {
        try {
            await axios.put(`http://localhost:8000/api/v1/categories/update-category/${data._id}`, data, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            getdata();
        } catch (error) {
            console.error(error);
        }
    }

    const columns = [
        { field: 'name', headerName: 'Name', width: 130 },
        { field: 'description', headerName: 'Description', width: 130 },
        {
            field: 'action',
            headerName: 'Action',
            width: 100,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleEdit(params.row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row)}>
                        <Delete />
                    </IconButton>
                </>
            ),
        },
    ];

    return (
        <React.Fragment>
            <Button variant="outlined" onClick={handleClickOpen}>
                Open form dialog
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>{editing ? 'Update' : 'Add'} Category</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            id="name"
                            name="name"
                            label="Name"
                            type="text"
                            fullWidth
                            variant="standard"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.name}
                            error={touched.name && Boolean(errors.name)}
                            helperText={touched.name && errors.name ? errors.name : ""}
                        />
                        <TextField
                            margin="dense"
                            id="description"
                            name="description"
                            label="Description"
                            type="text"
                            fullWidth
                            variant="standard"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.description}
                            error={touched.description && Boolean(errors.description)}
                            helperText={touched.description && errors.description ? errors.description : ""}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit">{editing ? 'Update' : 'Add'}</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={categorydata}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 5 },
                        },
                    }}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                    getRowId={(row) => row._id}
                />
            </div>
        </React.Fragment>
    );
}
