import docx
d = docx.Document(r'C:\Users\user\proyectos\onsv-express-2023-03-23\10. Manual Usuario.docx')
# Get full text
full_text = '\n'.join([p.text for p in d.paragraphs])
# Search for publicaciones-revistas
idx = full_text.find('publicaciones-revistas')
if idx >= 0:
    print(f'Found at position {idx}')
    print(full_text[max(0,idx-50):idx+100])
else:
    print('Not found with hyphen')
    # Try without hyphen
    idx2 = full_text.find('publicaciones revistas')
    if idx2 >= 0:
        print(f'Found without hyphen at position {idx2}')
    else:
        print('Not found at all')
    
    # Also search for just 'revistas' near 'publicaciones'
    idx3 = full_text.find('Revista')
    if idx3 >= 0:
        print(f'Revista found at {idx3}')
        print(full_text[max(0,idx3-30):idx3+80])