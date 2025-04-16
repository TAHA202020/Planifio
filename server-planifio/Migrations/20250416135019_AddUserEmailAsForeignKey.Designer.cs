﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace server_planifio.Migrations
{
    [DbContext(typeof(PlanifioDbContext))]
    [Migration("20250416135019_AddUserEmailAsForeignKey")]
    partial class AddUserEmailAsForeignKey
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.13")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("Project", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<string>("UserEmail")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.HasIndex("UserEmail");

                    b.ToTable("Projects");
                });

            modelBuilder.Entity("User", b =>
                {
                    b.Property<string>("email")
                        .HasColumnType("varchar(255)");

                    b.Property<int?>("otp")
                        .HasColumnType("int");

                    b.Property<DateTime?>("otp_expiration")
                        .HasColumnType("datetime(6)");

                    b.HasKey("email");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Project", b =>
                {
                    b.HasOne("User", "User")
                        .WithMany("Projects")
                        .HasForeignKey("UserEmail")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("User", b =>
                {
                    b.Navigation("Projects");
                });
#pragma warning restore 612, 618
        }
    }
}
