<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($request->has('search') && $request->search != '') {
            $query->where(function ($q) use ($request) {
                $q->where('nama_customer', 'like', '%' . $request->search . '%')
                  ->orWhere('kode_customer', 'like', '%' . $request->search . '%')
                  ->orWhere('nama_penanggungjawab', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('kategori') && $request->kategori != '') {
            $query->where('kategori', $request->kategori);
        }

        $customers = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'kategori']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_customer' => 'required|string|max:255',
            'nama_penanggungjawab' => 'nullable|string|max:255',
            'kategori' => ['required', Rule::in(['eceran', 'grosir', 'reseller', 'b2b'])],
            'nomor_hp' => 'required|string|max:20',
            'email' => 'nullable|email|max:100',
            'alamat' => 'required|string',
            'kota' => 'nullable|string|max:100',
            'catatan' => 'nullable|string',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $validated['kode_customer'] = Customer::generateKode();

        Customer::create($validated);

        return redirect()->back()->with('success', 'Customer berhasil ditambahkan.');
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'nama_customer' => 'required|string|max:255',
            'nama_penanggungjawab' => 'nullable|string|max:255',
            'kategori' => ['required', Rule::in(['eceran', 'grosir', 'reseller', 'b2b'])],
            'nomor_hp' => 'required|string|max:20',
            'email' => 'nullable|email|max:100',
            'alamat' => 'required|string',
            'kota' => 'nullable|string|max:100',
            'catatan' => 'nullable|string',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $customer->update($validated);

        return redirect()->back()->with('success', 'Customer berhasil diperbarui.');
    }

    public function destroy(Customer $customer)
    {
        if ($customer->ordersAktif()->exists()) {
            return redirect()->back()->with('error', 'Customer tidak dapat dihapus karena memiliki pesanan yang masih aktif.');
        }

        $customer->delete();

        return redirect()->back()->with('success', 'Customer berhasil dihapus.');
    }
}
