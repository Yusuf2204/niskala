<?php

namespace App\Providers;

use App\Services\SwaggerGeneratorFactory;
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
        //
    }
}

