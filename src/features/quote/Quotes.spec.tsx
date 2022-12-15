import Quote from "./Quote";
import { store } from "../../app/store";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Provider } from "react-redux";
import { render } from "../../../test-utils";

describe("Quote Component", () => {
  describe("Suite test", () => {
    it("Any sentence found", async () => {
      render(
        <Provider store={store}>
          <Quote />
        </Provider>
      );
      expect(
        screen.getByText("Nenhuma citação encontrada")
      ).toBeInTheDocument();
    });

    it("Get the text label and the button text and check if its correct", async () => {
      render(
        <Provider store={store}>
          <Quote />
        </Provider>
      );
      expect(screen.getByText("Obter citação aleatória")).toBeInTheDocument();
      expect(screen.getByText("Apagar")).toBeInTheDocument();
    });

    describe("When character name is not the possible values", () => {
      const server = setupServer(
        rest.get(
          "https://thesimpsonsquoteapi.glitch.me/quotes",
          (req, res, ctx) => {
            return res(ctx.status(200), ctx.json({ success: "Success" }));
          }
        )
      );
      beforeEach(() => {
        server.listen();
      });

      afterEach(() => {
        server.close();
        server.resetHandlers();
      });

      it("label invalid character name", async () => {
        render(<Quote />);

        const GetButtonMessage = await screen.findByText(
          "Obter citação aleatória"
        );
        await userEvent.click(GetButtonMessage);

        expect(
          await screen.findByText("Por favor, indique um nome válido")
        ).toBeInTheDocument();
      });
    });
  });

  describe("return the bart simpsons array get", () => {
    const server = setupServer(
      rest.get(
        "https://thesimpsonsquoteapi.glitch.me/quotes",
        (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json([
              {
                quote: "Eat my shorts",
                character: "Bart Simpson",
                image:
                  "https://cdn.glitch.com/3c3ffadc-3406-4440-bb95-d40ec8fcde72%2FBartSimpson.png?1497567511638",
                characterDirection: "Right",
              },
            ])
          );
        }
      )
    );

    beforeEach(() => {
      server.listen();
    });

    afterEach(() => {
      server.close();
      server.resetHandlers();
    });
    it("renders a quote from a random character that contains the typed string in its name", async () => {
      render(<Quote />);
      const InputValue = screen.getByPlaceholderText("Digite o nome do autor");
      await userEvent.type(InputValue, "bart");

      const quote = await screen.findByText("Obter citação");
      await userEvent.click(quote);

      const quoteBart = await screen.findByText("Bart Simpson");

      expect(quoteBart).toHaveStyle("min-height: 3rem");
    });
  });
});
