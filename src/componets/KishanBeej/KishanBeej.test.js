import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import KishanBeej from "./KishanBeej";

test("shows every workbook table with its full column set", () => {
  render(<KishanBeej />);

  expect(screen.getAllByRole("columnheader")).toHaveLength(25);
  expect(screen.getByRole("columnheader", { name: /मानक-जाँच/ })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: /उद्यान सचल दल केन्द्र की सूची/ })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("tab", { name: /आवंटन/ }));
  expect(screen.getAllByRole("columnheader")).toHaveLength(11);

  fireEvent.click(screen.getByRole("tab", { name: /वितरण/ }));
  expect(screen.getAllByRole("columnheader")).toHaveLength(19);
  expect(screen.getByRole("columnheader", { name: /आवंटन-सीमा जाँच/ })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: /कृषक हस्ताक्षर/ })).toBeInTheDocument();
});

test("calculates a distribution from the workbook's per-hectare standard", () => {
  render(<KishanBeej />);
  fireEvent.click(screen.getByRole("tab", { name: /वितरण/ }));

  fireEvent.change(screen.getByLabelText("उद्यान सचल दल केन्द्र"), {
    target: { value: "किनगोड़ीखाल" },
  });
  fireEvent.change(screen.getByLabelText("बीज किस्म"), {
    target: { value: "टमाटर BSHT-10 (Amol)" },
  });
  fireEvent.change(screen.getByLabelText("कृषक का नाम"), {
    target: { value: "डेमो कृषक" },
  });
  fireEvent.change(screen.getByLabelText("क्षेत्रफल (हेक्टेयर)"), {
    target: { value: "0.4" },
  });

  expect(screen.getAllByText("सीमा के भीतर")).toHaveLength(2);
  expect(screen.getAllByText("137.22 ग्राम")).toHaveLength(2);
  expect(screen.getAllByText("₹24,000.00").length).toBeGreaterThan(0);
  expect(screen.getAllByText("₹12,000.00").length).toBeGreaterThan(0);

  fireEvent.click(screen.getByRole("button", { name: /डेमो रजिस्टर में जोड़ें/ }));

  expect(screen.getByText("डेमो कृषक")).toBeInTheDocument();
  expect(screen.getByText(/इस सत्र में जुड़ गई/)).toBeInTheDocument();
});
