<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $company = Company::first();
        if ($company) {
            // If it still contains the legacy template logo, clear it to use default Niskala brand typography
            if ($company->comp_logo && str_contains($company->comp_logo, 'AZAAAABKCAYAAACVbQIx')) {
                $company->update(['comp_logo' => null, 'fav_icon' => null]);
            }
            return;
        }

        Company::create([
            'comp_name' => 'Niskala',
            'app_title' => 'Niskala',
            'comp_logo' => null,
            'fav_icon' => null,
        ]);
    }
}
