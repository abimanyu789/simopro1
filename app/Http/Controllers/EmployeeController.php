<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::query();

        // Search
        if ($request->has('search') && $request->search != '') {
            $query->where('nama_karyawan', 'like', '%' . $request->search . '%')
                  ->orWhere('divisi', 'like', '%' . $request->search . '%')
                  ->orWhere('posisi', 'like', '%' . $request->search . '%');
        }

        // Filter status
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        $employees = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_karyawan' => 'required|string|max:255',
            'divisi' => 'required|string|max:100',
            'posisi' => 'required|string|max:100',
            'jenis_kelamin' => ['required', Rule::in(['laki-laki', 'perempuan'])],
            'tanggal_lahir' => 'required|date',
            'nomor_hp' => 'required|string|max:20',
            'tanggal_bergabung' => 'required|date',
            'upah_borongan' => 'required|numeric|min:0',
            'nomor_rekening' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'alamat' => 'nullable|string',
            'deskripsi' => 'nullable|string',
            'status' => ['required', Rule::in(['aktif', 'nonaktif', 'cuti'])],
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $validated['foto_karyawan'] = $request->file('foto')->store('employees', 'public');
        }

        Employee::create($validated);

        return redirect()->back()->with('success', 'Karyawan berhasil ditambahkan.');
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'nama_karyawan' => 'required|string|max:255',
            'divisi' => 'required|string|max:100',
            'posisi' => 'required|string|max:100',
            'jenis_kelamin' => ['required', Rule::in(['laki-laki', 'perempuan'])],
            'tanggal_lahir' => 'required|date',
            'nomor_hp' => 'required|string|max:20',
            'tanggal_bergabung' => 'required|date',
            'upah_borongan' => 'required|numeric|min:0',
            'nomor_rekening' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'alamat' => 'nullable|string',
            'deskripsi' => 'nullable|string',
            'status' => ['required', Rule::in(['aktif', 'nonaktif', 'cuti'])],
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            // Hapus foto lama jika ada
            if ($employee->foto_karyawan) {
                Storage::disk('public')->delete($employee->foto_karyawan);
            }
            $validated['foto_karyawan'] = $request->file('foto')->store('employees', 'public');
        }

        $employee->update($validated);

        return redirect()->back()->with('success', 'Karyawan berhasil diperbarui.');
    }

    public function destroy(Employee $employee)
    {
        // Validasi: tidak boleh dihapus jika punya produksi aktif
        if ($employee->productionLogsAktif()->exists()) {
            return redirect()->back()->with('error', 'Karyawan tidak dapat dihapus karena memiliki log produksi aktif.');
        }

        $employee->delete();

        return redirect()->back()->with('success', 'Karyawan berhasil dihapus.');
    }
}
