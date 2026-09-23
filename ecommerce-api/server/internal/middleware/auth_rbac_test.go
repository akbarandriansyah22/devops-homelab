package middleware

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"

	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/observability"
	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/security"
)

func TestRequireRole_CustomerDeniedAdmin(t *testing.T) {
	logger := observability.NewLogger()
	app := fiber.New()
	app.Get("/admin", func(c *fiber.Ctx) error {
		c.Locals("roleID", 2) // customer
		return c.Next()
	}, RequireRole(logger, 1), func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/admin", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	io.ReadAll(resp.Body)
	if resp.StatusCode != fiber.StatusForbidden {
		t.Fatalf("want 403, got %d", resp.StatusCode)
	}
}

func TestRequireRole_AdminAllowed(t *testing.T) {
	logger := observability.NewLogger()
	app := fiber.New()
	app.Get("/admin", func(c *fiber.Ctx) error {
		c.Locals("roleID", 1)
		return c.Next()
	}, RequireRole(logger, 1), func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/admin", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("want 200, got %d", resp.StatusCode)
	}
}

func TestAuth_RejectsMissingToken(t *testing.T) {
	logger := observability.NewLogger()
	app := fiber.New()
	app.Get("/me", Auth("test-secret-must-be-at-least-32-chars", logger), func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusUnauthorized {
		t.Fatalf("want 401, got %d", resp.StatusCode)
	}
}

func TestAuth_AcceptsValidToken(t *testing.T) {
	secret := "test-secret-must-be-at-least-32-chars"
	logger := observability.NewLogger()
	token, err := security.GenerateToken(2, "cust@example.com", 2, "Cust", secret, 1)
	if err != nil {
		t.Fatal(err)
	}

	app := fiber.New()
	app.Get("/me", Auth(secret, logger), func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("want 200, got %d", resp.StatusCode)
	}
}