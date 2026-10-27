<?php

namespace App\Providers;

use App\Models\Invitation;
use App\Policies\InvitationPolicy;
use App\Services\SwaggerGeneratorFactory;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use L5Swagger\GeneratorFactory;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(GeneratorFactory::class, SwaggerGeneratorFactory::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Invitation::class, InvitationPolicy::class);
    }
}

