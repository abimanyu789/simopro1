<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class SettingsController extends Controller
{
    public function index()
    {
        $setting = Setting::firstOrCreate(['id' => 1], ['nama_usaha' => 'Provillo']);
        
        return Inertia::render('settings/index', [
            'setting' => $setting,
            'user' => auth()->user(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'nama_usaha' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'npwp' => 'nullable|string|max:25',
        ]);

        $setting = Setting::firstOrCreate(['id' => 1]);
        $setting->update($validated);

        return redirect()->back()->with('success', 'Informasi usaha berhasil diperbarui.');
    }

    public function updateLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|file|mimes:jpg,jpeg,png,svg|max:1024',
        ]);

        $setting = Setting::firstOrCreate(['id' => 1]);

        if ($request->hasFile('logo')) {
            if ($setting->logo_path) {
                Storage::disk('public')->delete($setting->logo_path);
            }
            $path = $request->file('logo')->store('settings', 'public');
            $setting->logo_path = $path;
            $setting->save();
        }

        return redirect()->back()->with('success', 'Logo berhasil diperbarui.');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->back()->with('success', 'Password berhasil diubah.');
    }
}
