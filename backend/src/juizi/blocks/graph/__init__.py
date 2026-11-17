"""Data visualisation block (``graphBlock``): the data behind its charts.

A linked CSV file is read on the server whenever Plone sends the page
(``transforms.GraphBlockSerializer``), so the page always arrives with the
file's current data and nobody has to press refresh. See ``table.py`` for
how a file becomes a table, and the block's README in volto-juizi-blocks for
the editor's side.
"""
