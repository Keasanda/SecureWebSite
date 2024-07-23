﻿using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SecureWebSite.Server.Models;

namespace SecureWebSite.Server.Data
{

   



    public class ApplicationDbContext : IdentityDbContext<User>
    {

        public DbSet<UserPasswordHistory> UserPasswordHistory { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
    }


}
