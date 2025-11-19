"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  TextField,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar, GridValueGetter } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { adminUsers } from './config/users';
import sampleRows from './data/sampleRows';

type ConfirmOption = 'room' | 'office';

type Row = {
  id: number;
  name: string;
  date: string;
  place: string;
  serviceType: string;
  income: number | null;
  cost: number | null;
  hours: number | null;
  status: string;
  notes: string;
  confirms: ConfirmOption[];
};

const initialRows: Row[] = sampleRows as unknown as Row[];

export default function Home() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const cookie = document.cookie.split('; ').find((c) => c.startsWith('user='));
    const uname = cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
    setIsAdmin(!!uname && adminUsers.includes(uname));
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFields, setSearchFields] = useState<string[]>([
    'name',
    'place',
    'serviceType',
    'notes',
  ]);

  const searchableOptions: { field: keyof Row; label: string }[] = [
    { field: 'name', label: 'Job / Technician' },
    { field: 'date', label: 'Date' },
    { field: 'place', label: 'Place' },
    { field: 'serviceType', label: 'Service type' },
    { field: 'income', label: 'Income' },
    { field: 'cost', label: 'Cost' },
    { field: 'hours', label: 'Hours' },
    { field: 'status', label: 'Status' },
    { field: 'notes', label: 'Notes' },
  ];



  const handleCellEditCommit = (params: any) => {
    const { id, field, value } = params;
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        if (field === 'income' || field === 'cost' || field === 'hours') {
          const n = value === '' ? null : Number(value);
          return { ...row, [field]: Number.isNaN(n) ? null : n };
        }
        return { ...row, [field]: value };
      })
    );
  };

  const handleDelete = (id: number) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleAddRow = () => {
    const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    setRows((prev) => [
      ...prev,
      {
        id: nextId,
        name: '',
        date: '',
        place: '',
        serviceType: '',
        income: null,
        cost: null,
        hours: null,
        status: 'Pending',
        notes: '',
        confirms: [],
      },
    ]);
  };

  const filteredRows = rows.filter((row) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return searchFields.some((field) => {
      const v = (row as any)[field];
      if (v == null) return false;
      return String(v).toLowerCase().includes(q);
    });
  });

  const handleConfirmChange = (id: number, newConfirms: ConfirmOption[]) => {
    if (!isAdmin) return;
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, confirms: newConfirms } : row))
    );
  };

  const getRowClassName = (params: any) => {
    const confirms: ConfirmOption[] = params.row.confirms || [];
    if (confirms.length === 0) return ''; // normal / white
    if (confirms.length === 1) return 'row-yellow';
    return 'row-green';
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Job / Technician',
      flex: 1.2,
      minWidth: 180,
      editable: isAdmin,
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 0.8,
      minWidth: 130,
      editable: isAdmin,
    },
    {
      field: 'place',
      headerName: 'Place',
      flex: 0.9,
      minWidth: 140,
      editable: isAdmin,
    },
    {
      field: 'serviceType',
      headerName: 'Service type',
      flex: 1,
      minWidth: 150,
      editable: isAdmin,
    },
    {
      field: 'income',
      headerName: 'Income',
      type: 'number',
      flex: 0.7,
      minWidth: 110,
      editable: isAdmin,
      renderCell: (params: any) => {
        const v = params.value ?? params.row?.income ?? null;
        return v == null ? '' : (Number(v).toLocaleString());
      },
    },
    {
      field: 'cost',
      headerName: 'Cost',
      type: 'number',
      flex: 0.7,
      minWidth: 110,
      editable: isAdmin,
      renderCell: (params: any) => {
        const v = params.value ?? params.row?.cost ?? null;
        return v == null ? '' : (Number(v).toLocaleString());
      },
    },
    {
      field: 'profit',
      headerName: 'Profit',
      type: 'number',
      flex: 0.7,
      minWidth: 110,
      valueGetter: (params: any) => {
        if (!params || !params.row) return 0; // extra safety
        const income = Number(params.row.income ?? 0);
        const cost = Number(params.row.cost ?? 0);
        return income - cost;
      },
      renderCell: (params: any) => {
        const v = params.value ?? 0;
        return v == null ? '' : (Number(v).toLocaleString());
      },
    },
    {
      field: 'hours',
      headerName: 'Hours',
      type: 'number',
      flex: 0.6,
      minWidth: 90,
      editable: isAdmin,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.7,
      minWidth: 120,
      editable: isAdmin,
    },
    {
      field: 'notes',
      headerName: 'Notes',
      flex: 1,
      minWidth: 160,
      editable: isAdmin,
    },
    {
      field: 'confirms',
      headerName: 'Confirms',
      flex: 1,
      minWidth: 160,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any, ConfirmOption[]>) => {
        const value = params.value || [];
        const id = params.row.id as number;

        const handleChange = (event: any) => {
          const val = event.target.value as string[];
          const unique = Array.from(new Set(val)) as ConfirmOption[];
          handleConfirmChange(id, unique);
        };

        return (
          <Select
            multiple
            value={value}
            onChange={handleChange}
            displayEmpty
            size="small"
            disabled={!isAdmin}
            sx={{ width: '100%' }}
            renderValue={(selected) => {
              if (!selected || (selected as string[]).length === 0) {
                return <span style={{ opacity: 0.4 }}>Select confirms</span>;
              }
              return (selected as string[]).join(', ');
            }}
          >
            <MenuItem value="room">
              <Checkbox checked={value.includes('room')} />
              <ListItemText primary="Room" />
            </MenuItem>
            <MenuItem value="office">
              <Checkbox checked={value.includes('office')} />
              <ListItemText primary="Office" />
            </MenuItem>
          </Select>
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      width: 60,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        isAdmin ? (
          <IconButton
            size="small"
            aria-label="delete row"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        ) : null
      ),
    },
  ];

  return (
    <main>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box component="h1" sx={{ fontSize: 22, fontWeight: 600, m: 0 }}>
            Technicians Business
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 220 }}
            />

            <Select
              multiple
              value={searchFields}
              onChange={(e) => setSearchFields(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]))}
              size="small"
              sx={{ minWidth: 180 }}
              renderValue={(selected) => (selected as string[]).join(', ')}
            >
              {searchableOptions.map((opt) => (
                <MenuItem key={opt.field as string} value={opt.field as string}>
                  <Checkbox checked={searchFields.includes(opt.field as string)} />
                  <ListItemText primary={opt.label} />
                </MenuItem>
              ))}
            </Select>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddRow}
              disabled={!isAdmin}
              title={isAdmin ? 'Add job' : 'You do not have permission to add jobs'}
            >
              Add job
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            height: 520,
            width: '100%',
            '& .row-yellow': {
              bgcolor: '#fff9c4',
            },
            '& .row-green': {
              bgcolor: '#c8e6c9',
            },
          }}
        >
          <DataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.id}
            onCellEditStop={handleCellEditCommit}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            disableRowSelectionOnClick
            density="compact"
            autoHeight={false}
            getRowClassName={getRowClassName}
          />
        </Box>
      </Container>
    </main>
  );
}
