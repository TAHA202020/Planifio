using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server_planifio.Migrations
{
    /// <inheritdoc />
    public partial class AddUserEmailAsForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserEmail",
                table: "Projects",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_UserEmail",
                table: "Projects",
                column: "UserEmail");

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Users_UserEmail",
                table: "Projects",
                column: "UserEmail",
                principalTable: "Users",
                principalColumn: "email",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Users_UserEmail",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Projects_UserEmail",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "UserEmail",
                table: "Projects");
        }
    }
}
