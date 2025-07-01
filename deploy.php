<?php
namespace Deployer;

require 'recipe/laravel.php';

// Config

set('repository', 'https://github.com/tagzloyd/Tracking-System-for-Borrowing-Equipment.git');

add('shared_files', []);
add('shared_dirs', []);
add('writable_dirs', []);

// Hosts

host('192.168.1.70')
    ->set('remote_user', 'create')
    ->set('deploy_path', '~/create-consultation');

// Hooks

after('deploy:failed', 'deploy:unlock');
