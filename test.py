from local_dev_test.testRunParser import test_func
import time

t1 = time.time()

if __name__ == "__main__":
    pdf_path = input("Enter the path to the PDF file: ")
    test_func(pdf_path)
    t2 = time.time()
    print(f"Time taken: {t2 - t1} seconds")